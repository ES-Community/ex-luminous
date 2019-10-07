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

  const model = new Model(modelDef, texture);
  const modelInstance = new ModelInstance(model);
  const mesh = new THREE.Mesh(modelInstance.geometry, modelInstance.material);
  mesh.scale.set(1.0 / 16.0, 1.0 / 16.0, 1.0 / 16.0);
  mesh.geometry.computeBoundingSphere();

  if (loadAnimation) {
    const modelAnimDef = await readJSON(join(MODELS_DIR, "animations", `${modelName}.csjsmodelanim`));
    const animation = new ModelAnimation(modelAnimDef);
    animation.animationFrame = 0;

    return { mesh, animation };
  }

  return { mesh, animation: null };
}

module.exports = loadCraftStudioModel;
