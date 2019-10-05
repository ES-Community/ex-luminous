"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class PlayerBehavior extends ScriptBehavior {
  static CreateMesh() {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    return new THREE.Mesh(geometry, material);
  }

  awake() {
    this.actor.setGlobalPosition(new THREE.Vector3(0, 10, 0));
    this.speed = 0.3;
    const sphere = PlayerBehavior.CreateMesh();

    this.actor.threeObject.add(sphere);
  }

  update() {
    if (game.input.isKeyDown("KeyW")) {
      this.actor.moveGlobal(new THREE.Vector3(-this.speed, 0, 0));
    }
    if (game.input.isKeyDown("KeyS")) {
      this.actor.moveGlobal(new THREE.Vector3(this.speed, 0, 0));
    }
    if (game.input.isKeyDown("KeyA")) {
      this.actor.moveGlobal(new THREE.Vector3(0, 0, this.speed));
    }
    if (game.input.isKeyDown("KeyD")) {
      this.actor.moveGlobal(new THREE.Vector3(0, 0, -this.speed));
    }
  }
}

module.exports = PlayerBehavior;
