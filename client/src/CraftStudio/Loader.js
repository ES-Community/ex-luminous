"use strict";

/**
 * ORIGINAL CODE CREATED BY Elisee MAURER
 * https://github.com/elisee/CraftStudio.js
 */

// Require Third-party Dependencies
const THREE = require("three");

// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join } = require("path");

// Require Internal Dependencies
const Model = require("./Model");
const ModelInstance = require("./ModelInstance");
const ModelAnimation = require("./ModelAnimation");

// CONSTANTS
const ASSETS_DIR = join(__dirname, "..", "..", "assets");
const MODELS_DIR = join(ASSETS_DIR, "models");

async function readJSON(filePath) {
  const buf = await readFile(filePath);

  return JSON.parse(buf.toString());
}

async function loadCraftStudioModel(modelName, loadAnimation = false) {
  const modelDef = await readJSON(join(MODELS_DIR, `${modelName}.csjsmodel`));
  const texture = await new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      join(ASSETS_DIR, "textures", `${modelName}.png`),
      (texture) => resolve(texture),
      void 0,
      reject
    );
  });
  texture.needsUpdate = true;

  const model = new ModelInstance(new Model(modelDef, texture));
  const mesh = new THREE.Mesh(model.geometry, model.material);
  mesh.scale.set(1.0 / 16.0, 1.0 / 16.0, 1.0 / 16.0);
  mesh.geometry.computeBoundingSphere();

  // TODO: load many animations ? (not only one...);
  const result = { model, mesh, animation: null };
  if (loadAnimation) {
    const modelAnimDef = await readJSON(join(MODELS_DIR, "animations", `${modelName}.csjsmodelanim`));
    result.animation = new ModelAnimation(modelAnimDef);
  }

  return result;
}

module.exports = loadCraftStudioModel;
