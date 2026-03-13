// preload.js
const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
	console.log("Electron app loaded");
});

contextBridge.exposeInMainWorld("electronAPI", {
  getModelsPath: () => ipcRenderer.invoke("get-models-path")
});