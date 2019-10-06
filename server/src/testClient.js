"use strict";

const path = require("path");

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const protoPath = path.join(__dirname, "../../protos/game.proto");

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).exluminous;

const client = new proto.Game("127.0.0.1:50051", grpc.credentials.createInsecure());

client.connect({ name: "Test" }, function(err, response) {
  console.log(response);
  const meta = new grpc.Metadata();
  meta.add("name", "Player name");
  const gameDataStream = client.GameData(meta);
  gameDataStream.on("data", (data) => {
    console.log("got game data", data);
  });
  gameDataStream.write({ type: "test", data: "xxxx" });
});
