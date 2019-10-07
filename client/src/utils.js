"use strict";

// Require Third-party Dependencies
const THREE = require("three");

function updateMeshTexture(actor, texture = null, color = null) {
  actor.threeObject.traverse(function(obj) {
    if (obj instanceof THREE.Mesh) {
      if (texture == null && color == null) {
        return;
      }
      if (texture == null) {
        obj.material = color;
      }
      if (color == null) {
        if (obj.material.map == texture) {
          return;
        }
        obj.material.map = texture;
        obj.material.needsUpdate = true;
      }
    }
  });
}

function updateMesh3D(actor, newMesh) {
  actor.threeObject.children.filter((children) => children.type == "Group");
  actor.threeObject.add(newMesh);
}

function updateLight(actor, type) {
  /** @type {THREE.PointLight} */
  let light = null;
  for (let i = 0; i < actor.threeObject.children.length; i++) {
    if (i === 0) {
      continue;
    }
    const children = actor.threeObject.children[i];
    if (children instanceof THREE.PointLight) {
      light = children;
      break;
    }
  }
  if (light === null) {
    return;
  }
  if (type === "add") {
    light.intensity = 1.5;
    light.distance = 8 * game.cubeSize;
  } else {
    light.intensity = 0.1;
    light.distance = 3 * game.cubeSize;
  }
}

module.exports = {
  updateMeshTexture,
  updateMesh3D,
  updateLight
};
