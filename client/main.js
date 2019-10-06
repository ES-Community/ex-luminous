"use strict";

const { app, BrowserWindow } = require("electron");
const { join } = require("path");

const isDev = require("electron-is-dev");

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
const [defaultView = "lobby"] = process.argv.slice(2);

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: join(__dirname, "public", "images", "ludumdare.ico"),
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.on("closed", () => {
    win = null;
  });

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/views/${defaultView}.html`);

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    app.quit();
  });
}

app.on("ready", createWindow);
