"use strict";

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("../protos/game.proto", {
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
  createClient
};
