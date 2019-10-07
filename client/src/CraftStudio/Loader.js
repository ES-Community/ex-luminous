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

function loadImage(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imagePath;
    img.addEventListener("load", () => resolve(img), false);
  });
}

async function loadCraftStudioModel(modelName, loadAnimation = false) {
  const modelDef = await readJSON(join(MODELS_DIR, `${modelName}.csjsmodel`));
  const img = await loadImage(join(ASSETS_DIR, "textures", `${modelName}.png`));

  // prettier-ignore
  const texture = new THREE.Texture(img, void 0, void 0, void 0, THREE.NearestFilter, THREE.NearestFilter, void 0, void 0, 0);
  texture.needsUpdate = true;

  const model = new ModelInstance(new Model(modelDef, texture));
  const mesh = new THREE.Mesh(model.geometry, model.material);
  mesh.scale.set(1, 1, 1);

  // TODO: load many animations ? (not only one...);
  const result = { model, mesh, animation: null };
  if (loadAnimation) {
    const modelAnimDef = await readJSON(join(MODELS_DIR, "animations", `${modelName}.csjsmodelanim`));
    result.animation = new ModelAnimation(modelAnimDef);
  }

  return result;
}

module.exports = loadCraftStudioModel;
