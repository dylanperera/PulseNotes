const { app, BrowserWindow } = require("electron");
const path = require("path");
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
