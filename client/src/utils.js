"use strict";

// Require Third-party Dependencies
const THREE = require("three");

function updateMeshTexture(actor, texture) {
  actor.threeObject.traverse(function(obj) {
    if (obj instanceof THREE.Mesh) {
      if (obj.material.map == texture) {
        return;
      } else {
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
  if (type == "remove") {
    if (actor.threeObject.children[1] instanceof THREE.PointLight) {
      actor.threeObject.children[1].visible = false;
    }
  } else if (type == "add") {
    if (actor.threeObject.children[1] instanceof THREE.PointLight) {
      actor.threeObject.children[1].visible = true;
    }
  }
}

module.exports = {
  updateMeshTexture,
  updateMesh3D,
  updateLight
};
