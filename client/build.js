"use strict";

const child_process = require("child_process");
const path = require("path");

const packager = require("electron-packager");
const fs = require("fs-extra");
const which = require("which");

process.on("unhandledRejection", (err) => console.log(err));
process.on("uncaughtException", (err) => console.log(err));

async function bundleElectronApp() {
  const options = {
    dir: __dirname,
    afterCopy: [copyExternal],
    arch: "x64",
    platform: process.argv[2],
    asar: true,
    out: path.join(__dirname, "dist"),
    overwrite: true,
    ignore: [/node_modules.grpc.deps.grpc.(src|third_party)/, /node_modules.three.examples/]
  };
  const result = await packager(options);
  console.log("build done", result);
}

async function copyExternal(buildPath, electronVersion, arch, platform, callback) {
  // Copy ".obj" files that are ignored by default
  const modelPath = "assets/models";
  const clientPath = path.join(__dirname, "../client", modelPath);
  const objFiles = (await fs.readdir(clientPath)).filter((file) => file.endsWith(".obj"));
  await Promise.all(
    objFiles.map((objFile) => fs.copy(path.join(clientPath, objFile), path.join(buildPath, modelPath, objFile)))
  );

  const serverPath = path.join(__dirname, "../server");
  const protoPath = path.join(__dirname, "../protos");
  await buildServer(serverPath, electronVersion);

  await fs.copy(serverPath, path.join(buildPath, "server"));
  await fs.copy(protoPath, path.join(buildPath, "protos"));
  await fs.remove(path.join(serverPath, "node_modules/grpc/deps/grpc/src"));
  await fs.remove(path.join(serverPath, "node_modules/grpc/deps/grpc/third_party"));
  callback();
}

async function buildServer(serverPath, electronVersion) {
  const npmPath = await which("npm");
  const execOptions = { cwd: serverPath, stdio: "inherit" };

  child_process.execFileSync(npmPath, ["ci", "--only=production"], execOptions);
  child_process.execFileSync(
    npmPath,
    [
      "rebuild",
      "grpc",
      `--target=${electronVersion}`,
      "--runtime=electron",
      "--dist-url=https://atom.io/download/electron"
    ],
    execOptions
  );
}

bundleElectronApp().catch(console.error);
