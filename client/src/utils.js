"use strict";

// Require Third-party Dependencies
const THREE = require("three");

function updateMeshTexture(actor, texture) {
  actor.threeObject.traverse(function(obj) {
    if (obj instanceof THREE.Mesh) {
      if (obj.material.map == texture) {
        return;
      }
      obj.material.map = texture;
      obj.material.needsUpdate = true;
    }
  });
}

function updateMesh3D(actor, newMesh) {
  actor.threeObject.children.filter((children) => children.type == "Group");
  actor.threeObject.add(newMesh);
}

function updateLight(actor, type) {
  if (!(actor.threeObject.children[1] instanceof THREE.PointLight)) {
    return;
  }

  actor.threeObject.children[1].visible = type === "add";
}

module.exports = {
  updateMeshTexture,
  updateMesh3D,
  updateLight
};
