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

module.exports = {
  createClient,
  Metadata: grpc.Metadata
};
