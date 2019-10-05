"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { spawn } = require("child_process");

// Require Third-party Dependencies
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const { remote } = require("electron");

// Variables & Loaders
let isServerStarted = false;
let errorTriggered = null;
const packageDefinition = protoLoader.loadSync("../protos/game.proto", {
  keepCase: true,
  enums: String,
  defaults: true,
  oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDefinition).exluminous;

async function createGameServer() {
  if (isServerStarted) {
    return;
  }
  isServerStarted = true;

  const playerName = document.getElementById("nickname").value.trim();
  if (playerName === "") {
    return showError("<p>player name <b>must not</b> be empty!</p>");
  }

  const currentWindow = remote.getCurrentWindow();
  const serverPath = join(__dirname, "..", "..", "server", "src", "server.js");

  const cp = spawn("node", [serverPath]);
  const stopServerBtn = setupServerInfo(cp);

  const closeWin = () => {
    cp.kill();
    isServerStarted = false;
  };
  currentWindow.on("close", closeWin);

  let gameWindow = new remote.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  cp.on("exit", () => {
    isServerStarted = false;
    if (gameWindow !== null && !gameWindow.isDestroyed()) {
      gameWindow.close();
    }
    currentWindow.removeListener("close", closeWin);
  });

  const stopServer = () => {
    gameWindow.close();
  };
  stopServerBtn.addEventListener("click", stopServer);
  gameWindow.on("closed", () => {
    cp.kill();
    isServerStarted = false;
    gameWindow = null;
    stopServerBtn.removeEventListener("click", stopServer);
  });

  gameWindow.webContents.openDevTools();
  gameWindow.loadURL(`file://${__dirname}/game.html?server=127.0.0.1:50051&name=${playerName}`);
}

function setupServerInfo(cp) {
  const mainElement = document.getElementById("main");
  const serverInfoElement = document.getElementById("server-info");
  const stopServerBtn = document.getElementById("stop-server");

  mainElement.style.display = "none";
  serverInfoElement.style.display = "flex";

  const exitListener = () => {
    cp.kill();
    mainElement.style.display = "flex";
    serverInfoElement.style.display = "none";
  };
  stopServerBtn.addEventListener("click", exitListener);

  cp.on("message", (msg) => {
    // TODO: update view with info
    console.log(msg);
  });

  cp.on("exit", () => {
    mainElement.style.display = "flex";
    serverInfoElement.style.display = "none";
    stopServerBtn.removeEventListener("click", exitListener);
  });

  return stopServerBtn;
}

function connectPlayerToServer() {
  event.preventDefault();
  const playerName = document.getElementById("nickname").value.trim();
  if (playerName === "") {
    return showError("<p>player name <b>must not</b> be empty!</p>");
  }

  // Retrieve ip in form
  const ipInputElement = document.getElementById("ip-to-join");
  let ipValue = ipInputElement.value.trim();
  if (ipValue === "") {
    ipValue = "127.0.0.1:50051";
  }

  if (errorTriggered) {
    hideError();
  }

  const client = new proto.Game(ipValue, grpc.credentials.createInsecure());
  client.connect({ name: playerName }, function(err) {
    if (err) {
      showError(`<p>Connection to <b>${ipValue}</b> failed!</p>`);
    } else {
      const currentWindow = remote.getCurrentWindow();
      currentWindow.loadURL(`file://${__dirname}/game.html?server=${ipValue}&name=${playerName}`);
    }
  });
}

function showError(content = "") {
  const error = document.querySelector(".error");
  error.classList.remove("hide");
  error.innerHTML = content;
  errorTriggered = setTimeout(hideError, 5000);
}

function hideError() {
  const error = document.querySelector(".error");

  error.classList.add("hide");
  errorTriggered = null;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("host-game").addEventListener("click", createGameServer);
  document.getElementById("join-game").addEventListener("submit", connectPlayerToServer);
});
