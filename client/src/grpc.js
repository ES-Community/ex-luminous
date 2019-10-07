"use strict";

const path = require("path");

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const isDev = require("electron-is-dev");

const packageDefinition = protoLoader.loadSync(path.join(__dirname, isDev ? "../.." : "..", "protos/game.proto"), {
  keepCase: true,
  enums: String,
  defaults: true,
  oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDefinition).exluminous;

function createClient(address) {
  return new proto.Game(address, grpc.credentials.createInsecure());
}

async function lobbyConnectionAttempt(grpcClient) {
  const fadeTxt = document.getElementById("fade-txt");
  const fadeSpan = document.getElementById("fade-span");
  let connectionPayload = null;

  // eslint-disable-next-line
  while (1) {
    connectionPayload = await new Promise((resolve) => {
      grpcClient.connect({ name: playerName }, function(err, data) {
        if (err) {
          fadeTxt.innerHTML = `💀 ${err.message}`;
          fadeSpan.style.visibility = "visible";
          resolve(null);
        } else {
          resolve(data);
        }
      });
    });
    if (connectionPayload !== null) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
    fadeSpan.style.visibility = "hidden";
    fadeTxt.innerHTML = `🕐 Connection in progress to <b>${server}</b>`;
  }

  return connectionPayload;
}

module.exports = {
  createClient,
  lobbyConnectionAttempt,
  Metadata: grpc.Metadata
};
