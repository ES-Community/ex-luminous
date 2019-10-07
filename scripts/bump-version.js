"use strict";

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

const pack = require("../package.json");

const newVersion = pack.version;

function updatePackage(file) {
  file = path.resolve(file);
  const data = require(file);
  data.version = newVersion;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  child_process.execSync("git add " + file);
}

["./client/package.json", "./client/package-lock.json", "./server/package.json", "./server/package-lock.json"].map(
  updatePackage
);
