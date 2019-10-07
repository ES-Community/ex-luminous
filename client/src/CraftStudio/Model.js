"use strict";

/**
 * ORIGINAL CODE CREATED BY Elisee MAURER
 * https://github.com/elisee/CraftStudio.js
 */

// Require Third-party Dependencies
const THREE = require("three");

class Model {
  constructor(modelDef, texture) {
    this.texture = texture;
    this.rootBoxes = [];
    this.boxesByName = {};
    this.boxCount = 0;
    this.transparent = modelDef.transparent;

    for (let i = 0; i < modelDef.tree.length; i++) {
      this.rootBoxes.push(this.buildBox(modelDef.tree[i]));
    }
  }

  Dispose() {
    this.texture.dispose();
    this.texture = null;
    this.rootBoxes = null;
    this.boxesByName = null;
  }

  buildBox(boxDef, parent) {
    const orientation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...boxDef.rotation.map((value) => THREE.Math.degToRad(value)))
    );
    const box = {
      name: boxDef.name,
      position: new THREE.Vector3(...boxDef.position),
      orientation,
      offsetFromPivot: new THREE.Vector3(...boxDef.offsetFromPivot),
      size: new THREE.Vector3(...boxDef.size),
      texOffset: boxDef.texOffset,
      parent,
      children: []
    };
    this.boxesByName[boxDef.name] = box;

    if (Reflect.has(boxDef, "vertexCoords")) {
      const coords = [];

      for (let i = 0; i < boxDef.vertexCoords.length; i++) {
        const [x, y, z] = boxDef.vertexCoords[i];
        coords.push(new THREE.Vector3(x, y, z));
      }
      box.vertexCoords = coords;
    } else {
      box.vertexCoords = [
        new THREE.Vector3(-box.size.x / 2, box.size.y / 2, -box.size.z / 2),
        new THREE.Vector3(box.size.x / 2, box.size.y / 2, -box.size.z / 2),
        new THREE.Vector3(box.size.x / 2, -box.size.y / 2, -box.size.z / 2),
        new THREE.Vector3(-box.size.x / 2, -box.size.y / 2, -box.size.z / 2),
        new THREE.Vector3(box.size.x / 2, box.size.y / 2, box.size.z / 2),
        new THREE.Vector3(-box.size.x / 2, box.size.y / 2, box.size.z / 2),
        new THREE.Vector3(-box.size.x / 2, -box.size.y / 2, box.size.z / 2),
        new THREE.Vector3(box.size.x / 2, -box.size.y / 2, box.size.z / 2)
      ];
    }

    this.boxCount++;
    for (let i = 0; i < boxDef.children.length; i++) {
      box.children.push(this.buildBox(boxDef.children[i], box));
    }

    return box;
  }
}

module.exports = Model;
