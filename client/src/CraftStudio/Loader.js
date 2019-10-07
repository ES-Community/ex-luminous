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
const ASSETS_DIR = join(__dirname, "..", "assets");
const MODELS_DIR = join(ASSETS_DIR, "models");
console.log(ASSETS_DIR);

async function readJSON(filePath) {
  const buf = await readFile(filePath);

  return JSON.parse(buf.toString());
}

async function loadCraftStudioModel(modelName, loadAnimation = false) {
  const modelDef = await readJSON(join(MODELS_DIR, `${modelName}.csjsmodel`));
  const img = new Image();
  img.src = join(ASSETS_DIR, "textures", `${modelName}.png`);

  return new Promise((resolve) => {
    img.onload = function() {
      // prettier-ignore
      const texture = new THREE.Texture(img, void 0, void 0, void 0, THREE.NearestFilter, THREE.NearestFilter, void 0, void 0, 0);
      texture.needsUpdate = true;

      const model = new Model(modelDef, texture);
      const modelInstance = new ModelInstance(model);
      const mesh = new THREE.Mesh(modelInstance.geometry, modelInstance.material);
      mesh.scale.set(1.0 / 16.0, 1.0 / 16.0, 1.0 / 16.0);
      mesh.geometry.computeBoundingSphere();

      if (loadAnimation) {
        readJSON(join(MODELS_DIR, "animations", `${modelName}.csjsmodelanim`))
          .then((modelAnimDef) => {
            const animation = new ModelAnimation(modelAnimDef);
            animation.animationFrame = 0;

            resolve({ mesh, animation });
          })
          .catch(console.error);
      } else {
        resolve({ mesh, animation: null });
      }
    };
  });
}

module.exports = loadCraftStudioModel;
