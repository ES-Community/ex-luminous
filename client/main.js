'use strict';

const { app, BrowserWindow } = require('electron');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.on("closed", () => {
      win = null;
  });

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Open the DevTools.
  win.webContents.openDevTools();

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    app.quit();
  });
}

app.on('ready', createWindow);
