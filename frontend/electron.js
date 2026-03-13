const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const fs = require("fs");

app.name = "PulseNotes";

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
		icon: path.join(__dirname, "public", "icons", "PulseNotesAppIcon.png"),
	});

	// During development, load localhost
	win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
	const modelsPath = path.join(app.getPath("userData"), "models");

	fs.mkdirSync(modelsPath, { recursive: true });

	ipcMain.handle("get-models-path", () =>  {return modelsPath});

	createWindow();

	if (process.platform === "darwin") {
		app.dock.setIcon(
			path.join(__dirname, "public", "icons", "PulseNotesAppIcon.png"),
		);
	}

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
