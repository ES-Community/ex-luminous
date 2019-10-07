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
    for (let i = 0; i < modelDef.tree.length; i++) {
      this.rootBoxes.push(this.buildBox(modelDef, modelDef.tree[i]));
    }
    this.transparent = modelDef.transparent;
  }

  dispose() {
    this.texture.dispose();
    this.texture = null;
    this.rootBoxes = null;
    this.boxesByName = null;
  }

  buildBox(model, boxDef, parentBox) {
    const box = (model.boxesByName[boxDef.name] = {
      name: boxDef.name,
      position: new THREE.Vector3(boxDef.position[0], boxDef.position[1], boxDef.position[2]),
      orientation: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          THREE.Math.degToRad(boxDef.rotation[0]),
          THREE.Math.degToRad(boxDef.rotation[1]),
          THREE.Math.degToRad(boxDef.rotation[2])
        )
      ),
      offsetFromPivot: new THREE.Vector3(
        boxDef.offsetFromPivot[0],
        boxDef.offsetFromPivot[1],
        boxDef.offsetFromPivot[2]
      ),
      size: new THREE.Vector3(boxDef.size[0], boxDef.size[1], boxDef.size[2]),
      texOffset: boxDef.texOffset,
      parent: parentBox,
      children: []
    });

    if (boxDef.vertexCoords !== null) {
      box.vertexCoords = [];

      for (let i = 0; i < boxDef.vertexCoords.length; i++) {
        const [x, y, z] = boxDef.vertexCoords[i];
        box.vertexCoords.push(new THREE.Vector3(x, y, z));
      }
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

    model.boxCount++;
    for (let i = 0; i < boxDef.children.length; i++) {
      box.children.push(this.buildBox(model, boxDef.children[i], box));
    }

    return box;
  }
}

module.exports = Model;
