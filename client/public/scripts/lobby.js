"use strict";

const { join } = require("path");
const { spawn } = require("child_process");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const { remote } = require("electron");

let isHostingGame = false;
async function hostGame() {
  if (isHostingGame) {
    return;
  }
  isHostingGame = true;

  const currentWindow = remote.getCurrentWindow();
  const serverPath = join(__dirname, "..", "..", "server", "src", "server.js");

  const cp = spawn("node", [serverPath]);
  setupServerInfo(cp);
  const closeWin = () => {
    cp.kill();
    isHostingGame = false;
  };
  currentWindow.on("close", closeWin);

  cp.on("exit", () => {
    isHostingGame = false;
    currentWindow.removeListener("close", closeWin);
  });

  let gameWindow = new remote.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  gameWindow.on("closed", () => {
    console.log("window closed!");
    cp.kill();
    cp.emit("exit");
    isHostingGame = false;
    gameWindow = null;
  });

  gameWindow.webContents.openDevTools();
  gameWindow.loadFile("./views/game.html");
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
    stopServerBtn.removeEventListener("click", exitListener);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const hostGameButton = document.getElementById("host-game");
  const joinGameForm = document.getElementById("join-game");

  hostGameButton.addEventListener("click", hostGame);
  joinGameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const ipInputElement = document.getElementById("ip-to-join");
    let ipValue = ipInputElement.value.trim();
    if (ipValue === "") {
      ipValue = "127.0.0.1:50051";
    }

    const packageDefinition = protoLoader.loadSync("../protos/game.proto", {
      keepCase: true,
      enums: String,
      defaults: true,
      oneofs: true
    });

    const proto = grpc.loadPackageDefinition(packageDefinition).exluminous;
    const client = new proto.Game(ipValue, grpc.credentials.createInsecure());

    client.connect({}, function() {
      console.log("connected");
    });
  });
});
