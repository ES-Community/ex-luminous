"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { spawn } = require("child_process");

// Require Third-party Dependencies
const { remote } = require("electron");

const grpc = require("../src/grpc");

// Variables & Loaders
let isServerStarted = false;
let errorTriggered = null;

async function createGameServer() {
  const playerName = document.getElementById("nickname").value.trim();
  if (playerName === "") {
    return showError("<p>player name <b>must not</b> be empty!</p>");
  }
  sessionStorage.setItem("cachedPlayerName", playerName);

  if (isServerStarted) {
    return;
  }
  isServerStarted = true;

  const currentWindow = remote.getCurrentWindow();
  const serverPath = join(__dirname, "..", "..", "server", "src", "server.js");

  const cp = spawn("node", [serverPath], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
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
  const serverInfoPlayersElement = document.getElementById("server-info-players");
  const serverInfoTimeElement = document.getElementById("server-info-time");
  const stopServerBtn = document.getElementById("stop-server");

  mainElement.style.display = "none";
  serverInfoElement.style.display = "flex";

  const exitListener = () => {
    cp.kill();
    mainElement.style.display = "flex";
    serverInfoElement.style.display = "none";
  };
  stopServerBtn.addEventListener("click", exitListener);

  cp.stdout.on("data", (d) => console.log(d.toString()));
  cp.stderr.on("data", (d) => console.error(d.toString()));

  cp.on("message", (msg) => {
    serverInfoPlayersElement.innerHTML = "";
    for (const player of msg.players) {
      const li = document.createElement("li");
      li.innerText = `${player.name} (${player.ip})`;
      serverInfoPlayersElement.appendChild(li);
    }
    serverInfoTimeElement.innerText = `${Math.round(msg.time * 100) / 100} seconds`;
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

  const client = grpc.createClient(ipValue);
  client.connect({ name: playerName }, function(err) {
    if (err) {
      showError(`<p>Connection to <b>${ipValue}</b> failed!</p>`);
    } else {
      sessionStorage.setItem("cachedPlayerName", playerName);

      const currentWindow = remote.getCurrentWindow();
      currentWindow.loadURL(`file://${__dirname}/game.html?server=${ipValue}&name=${playerName}`);
    }
  });
}

function showError(content = "") {
  if (errorTriggered !== null) {
    clearTimeout(errorTriggered);
  }
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
  const localName = sessionStorage.getItem("cachedPlayerName");
  if (localName !== null) {
    const nickNameInput = document.getElementById("nickname");
    nickNameInput.value = localName;
  }

  document.getElementById("host-game").addEventListener("click", createGameServer);
  document.getElementById("join-game").addEventListener("submit", connectPlayerToServer);
});
