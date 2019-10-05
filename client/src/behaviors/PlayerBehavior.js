"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class PlayerBehavior extends ScriptBehavior {
  awake() {
    console.log("player awake!");
    this.actor.setGlobalPosition(new THREE.Vector3(0, 10, 0));
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);
    // sphere.position = new THREE.Vector3(0, 5, 0);
    this.actor.threeObject.add(sphere);
  }

  update() {
    const speed = 0.2;
    if (game.input.isKeyDown("KeyW")) {
      this.actor.moveGlobal(new THREE.Vector3(-speed, 0, 0));
    }
    if (game.input.isKeyDown("KeyS")) {
      this.actor.moveGlobal(new THREE.Vector3(speed, 0, 0));
    }
    if (game.input.isKeyDown("KeyA")) {
      this.actor.moveGlobal(new THREE.Vector3(0, 0, speed));
    }
    if (game.input.isKeyDown("KeyD")) {
      this.actor.moveGlobal(new THREE.Vector3(0, 0, -speed));
    }
  }
}

module.exports = PlayerBehavior;
