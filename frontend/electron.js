const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

app.name = "PulseNotes";

const isDev = !app.isPackaged;

// Read ports from frontend/.env (dev) or fall back to defaults
const FRONTEND_PORT = process.env.PORT || "3000";

let backendProcess = null;
let mainWindow = null;

function killBackendProcess() {
	if (!backendProcess && process.platform === "win32") {
		// Fallback: kill by process name if we lost track
		console.log("No process object, attempting to kill by name");
		try {
			const { execSync } = require("child_process");
			execSync("taskkill /IM pulsenotes-backend.exe /F", { stdio: "pipe" });
			console.log("Backend killed by name via taskkill");
		} catch (e) {
			// Process might not exist
		}
		return;
	}

	if (!backendProcess) {
		console.log("No backend process to kill");
		return;
	}

	console.log(`Attempting to kill backend process (PID: ${backendProcess.pid})`);

	try {
		if (process.platform === "win32") {
			const { execSync } = require("child_process");
			
			// Try PID-specific kill first
			if (backendProcess.pid) {
				try {
					execSync(`taskkill /PID ${backendProcess.pid} /F`, { stdio: "pipe" });
					console.log("Backend killed via taskkill (PID)");
				} catch (e) {
					console.log("PID-specific taskkill failed, trying by name");
					try {
						execSync("taskkill /IM pulsenotes-backend.exe /F", { stdio: "pipe" });
						console.log("Backend killed by name via taskkill");
					} catch (e2) {
						console.log("taskkill failed, trying process.kill");
						backendProcess.kill("SIGKILL");
					}
				}
			} else {
				// No PID, try by name
				execSync("taskkill /IM pulsenotes-backend.exe /F", { stdio: "pipe" });
			}
		} else {
			backendProcess.kill("SIGKILL");
		}
	} catch (e) {
		console.error("Error killing backend:", e.message);
	}

	backendProcess = null;
}

function getBackendDir() {
	if (isDev) {
		return path.join(__dirname, "..", "backend");
	}
	return path.join(process.resourcesPath, "backend");
}

function parseEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return {};

	const env = {};
	const content = fs.readFileSync(filePath, "utf8");
	const lines = content.split(/\r?\n/);

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const idx = trimmed.indexOf("=");
		if (idx === -1) continue;

		const key = trimmed.slice(0, idx).trim();
		let value = trimmed.slice(idx + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		env[key] = value;
	}

	return env;
}

function askForToken() {
	return new Promise((resolve) => {
		const promptWindow = new BrowserWindow({
			width: 520,
			height: 260,
			resizable: false,
			minimizable: false,
			maximizable: false,
			modal: true,
			autoHideMenuBar: true,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
			},
		});

		const html = `
			<!doctype html>
			<html>
			<head>
				<meta charset="utf-8" />
				<title>PulseNotes Setup</title>
				<style>
					body { font-family: sans-serif; margin: 18px; }
					input { width: 100%; padding: 8px; margin-top: 8px; box-sizing: border-box; }
					.row { margin-top: 14px; display: flex; gap: 8px; justify-content: flex-end; }
					button { padding: 7px 12px; }
				</style>
			</head>
			<body>
				<h3>Hugging Face Token Required</h3>
				<p>Enter your HF token to enable model downloads. You can skip and set it later.</p>
				<input id="token" type="password" placeholder="hf_..." autofocus />
				<div class="row">
					<button id="skip">Skip</button>
					<button id="save">Continue</button>
				</div>
				<script>
					const { ipcRenderer } = require('electron');
					document.getElementById('save').addEventListener('click', () => {
						ipcRenderer.send('hf-token-submitted', document.getElementById('token').value.trim());
					});
					document.getElementById('skip').addEventListener('click', () => {
						ipcRenderer.send('hf-token-submitted', '');
					});
				</script>
			</body>
			</html>
		`;

		ipcMain.once("hf-token-submitted", (_event, token) => {
			resolve(token || "");
			if (!promptWindow.isDestroyed()) promptWindow.close();
		});

		promptWindow.on("closed", () => resolve(""));
		promptWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
	});
}

async function buildBackendEnv() {
	const backendDir = getBackendDir();
	const envFile = path.join(backendDir, ".env");
	const backendEnv = parseEnvFile(envFile);

	const backendPort = process.env.REACT_APP_BACKEND_PORT || backendEnv.BACKEND_PORT || "8000";
	const frontendPort = process.env.PORT || backendEnv.FRONTEND_PORT || FRONTEND_PORT;

	// Priority: process env > .env > persisted token > prompt
	let hfToken = process.env.HF_TOKEN || backendEnv.HF_TOKEN || "";
	const tokenFile = path.join(app.getPath("userData"), "hf_token.txt");

	if (!hfToken && fs.existsSync(tokenFile)) {
		hfToken = fs.readFileSync(tokenFile, "utf8").trim();
	}

	if (!hfToken) {
		hfToken = await askForToken();
		if (hfToken) {
			fs.writeFileSync(tokenFile, hfToken, "utf8");
		}
	}

	return {
		...process.env,
		BACKEND_PORT: backendPort,
		FRONTEND_PORT: frontendPort,
		HF_MODELS_REPO_ID: process.env.HF_MODELS_REPO_ID || backendEnv.HF_MODELS_REPO_ID || "",
		INTERNET_CONNECTION_TEST_URL:
			process.env.INTERNET_CONNECTION_TEST_URL || backendEnv.INTERNET_CONNECTION_TEST_URL || "",
		HF_TOKEN: hfToken,
		__BACKEND_PORT_FOR_HEALTHCHECK: backendPort,
	};
}

function startBackend(runtimeEnv) {
	let cmd, args, opts;

	if (isDev) {
		// Dev: run prebuilt backend executable from backend/dist
		const backendDir = getBackendDir();
		const binaryName = process.platform === "win32"
			? "pulsenotes-backend.exe"
			: "pulsenotes-backend";
		cmd = path.join(backendDir, "dist", binaryName);
		args = [];
		opts = { cwd: backendDir, stdio: "inherit", env: runtimeEnv };

		if (!fs.existsSync(cmd)) {
			console.error(`Backend executable not found at ${cmd}. Build it first.`);
			return false;
		}
	} else {
		// Prod: run the bundled binary placed in resources/backend/
		const primaryBinaryName = process.platform === "win32"
			? "pulsenotes-backend.exe"
			: "pulsenotes-backend";
		const fallbackBinaryName = process.platform === "win32"
			? "pulsenotes-backend"
			: "pulsenotes-backend.exe";
		const primaryPath = path.join(process.resourcesPath, "backend", primaryBinaryName);
		const fallbackPath = path.join(process.resourcesPath, "backend", fallbackBinaryName);
		cmd = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;
		args = [];
		opts = { stdio: "pipe", env: runtimeEnv };

		if (!fs.existsSync(cmd)) {
			console.error(`Backend executable not found in packaged resources. Checked: ${primaryPath} and ${fallbackPath}`);
			return false;
		}
	}

	backendProcess = spawn(cmd, args, { ...opts, detached: false });

	console.log(`Backend process started with PID: ${backendProcess.pid}`);

	backendProcess.on("error", (err) => {
		console.error("Failed to start backend:", err.message);
	});

	backendProcess.on("exit", (code, signal) => {
		console.log(`Backend process exited with code ${code} and signal ${signal}`);
		backendProcess = null;
	});

	return true;
}

// Poll /health until backend is ready, then call onReady()
function waitForBackend(port, onReady, retries = 30, intervalMs = 1000) {
	const url = `http://127.0.0.1:${port}/health`;

	const attempt = (remaining) => {
		if (remaining <= 0) {
			console.error("Backend did not become ready in time.");
			return;
		}

		http.get(url, (res) => {
			if (res.statusCode === 200) {
				onReady();
			} else {
				setTimeout(() => attempt(remaining - 1), intervalMs);
			}
		}).on("error", () => {
			setTimeout(() => attempt(remaining - 1), intervalMs);
		});
	};

	attempt(retries);
}

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
		icon: path.join(__dirname, "public", "icons", "PulseNotesAppIcon.png"),
	});

	mainWindow = win;

	if (isDev) {
		win.loadURL(`http://localhost:${FRONTEND_PORT}`);
	} else {
		win.loadFile(path.join(__dirname, "build", "index.html"));
	}

	// Kill backend when window closes
	win.on("closed", () => {
		console.log("Window closed, killing backend process");
		killBackendProcess();
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	const modelsPath = path.join(app.getPath("userData"), "models");
	fs.mkdirSync(modelsPath, { recursive: true });
	ipcMain.handle("get-models-path", () => modelsPath);

	if (isDev) {
		// Dev: assume backend is running separately, just open the window
		createWindow();
	} else {
		buildBackendEnv().then((runtimeEnv) => {
			const backendPort = runtimeEnv.__BACKEND_PORT_FOR_HEALTHCHECK || "8000";
			const started = startBackend(runtimeEnv);
			if (!started) return;

			waitForBackend(backendPort, () => {
				createWindow();
			});
		});
	}

	if (process.platform === "darwin") {
		app.dock.setIcon(
			path.join(__dirname, "public", "icons", "PulseNotesAppIcon.png"),
		);
	}

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("will-quit", () => {
	console.log("App will quit, killing backend process");
	killBackendProcess();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
