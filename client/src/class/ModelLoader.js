"use strict";

// Require Node.js Dependencies
const { extname } = require("path");

// Require Third-party Dependencies
const THREE = require("three");
require("three/examples/js/loaders/OBJLoader");

class ModelLoader {
  constructor(options) {
    this.textureLoader = new THREE.TextureLoader();
    this.objLoader = new THREE.OBJLoader();

    this.textureLoader.setPath(options.texturePath);
    this.objLoader.setPath(options.modelsPath);
  }

  loadTexture(name) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(name, resolve, void 0, reject);
    });
  }

  loadObject(modelName) {
    return new Promise((resolve, reject) => {
      const objName = extname(modelName) === ".obj" ? modelName : `${modelName}.obj`;
      this.objLoader.load(objName, resolve, void 0, reject);
    });
  }

  async load(objName, textureName = objName) {
    const [map, obj] = await Promise.all([this.loadTexture(textureName), this.loadObject(objName)]);
    const material = new THREE.MeshPhongMaterial({ map });
    obj.traverse((node) => {
      if (node.isMesh) {
        node.material = material;
      }
    });

    return obj;
  }
}

module.exports = ModelLoader;
