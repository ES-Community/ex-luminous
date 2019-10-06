"use strict";

const child_process = require("child_process");
const path = require("path");

const packager = require("electron-packager");
const fs = require("fs-extra");
const which = require("which");

async function bundleElectronApp() {
  const options = {
    dir: __dirname,
    afterCopy: [copyExternal],
    arch: "x64",
    platform: "win32",
    asar: true,
    out: __dirname + "/dist",
    overwrite: true
  };
  console.log("building");
  const result = await packager(options);
  console.log("build done", result);
}

async function copyExternal(buildPath, electronVersion, platform, arch) {
  const serverPath = path.join(__dirname, "../server");
  const protoPath = path.join(__dirname, "../protos");
  await buildServer(serverPath, electronVersion);
  await fs.copy(serverPath, path.join(buildPath, "server"));
  await fs.copy(protoPath, path.join(buildPath, "protos"));
}

async function buildServer(serverPath, electronVersion) {
  const npmPath = await which("npm");
  child_process.execFileSync(npmPath, ["ci", "--production"], { cwd: serverPath });
  child_process.execFileSync(
    npmPath,
    [
      "rebuild",
      "grpc",
      `--target=${electronVersion}`,
      "--runtime=electron",
      "--dist-url=https://atom.io/download/electron"
    ],
    {
      cwd: serverPath
    }
  );
}

bundleElectronApp().catch(console.error);
