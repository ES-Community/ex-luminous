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
  let light = null;
  for (const children of actor.threeObject.children) {
    if (children instanceof THREE.PointLight) {
      light = children;
      break;
    }
  }
  if (light === null) {
    return;
  }

  const isVisible = type === "add";
  if (light.visible !== isVisible) {
    light.visible = isVisible;
  }
}

module.exports = {
  updateMeshTexture,
  updateMesh3D,
  updateLight
};
