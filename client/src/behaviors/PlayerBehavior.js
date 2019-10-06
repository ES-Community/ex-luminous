"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class PlayerBehavior extends ScriptBehavior {
  static CreateMesh(color = 0xffff00) {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color });

    return new THREE.Mesh(geometry, material);
  }

  static PosToVector3(pos) {
    return new THREE.Vector3(pos.x, PlayerBehavior.Y_POSITION, pos.z);
  }

  awake() {
    this.actor.setGlobalPosition(new THREE.Vector3(0, PlayerBehavior.Y_POSITION, 0));
    this.speed = 0.3;
    const sphere = PlayerBehavior.CreateMesh();

    this.actor.threeObject.add(sphere);
  }

  update() {
    const mapSizeZ = game.mapSize.z * 2 - 1;
    const mapSizeX = game.mapSize.x * 2 - 1;

    if (game.input.isKeyDown("KeyW")) {
      this.actor.threeObject.translateX(-this.speed);
    }
    if (game.input.isKeyDown("KeyS")) {
      this.actor.threeObject.translateX(this.speed);
    }
    if (game.input.isKeyDown("KeyA")) {
      this.actor.threeObject.translateZ(this.speed);
    }
    if (game.input.isKeyDown("KeyD")) {
      this.actor.threeObject.translateZ(-this.speed);
    }

    const currentPos = this.actor.threeObject.position;
    if (currentPos.z < -mapSizeZ) {
      this.actor.threeObject.position.z = -mapSizeZ;
    }
    if (currentPos.z > mapSizeZ) {
      this.actor.threeObject.position.z = mapSizeZ;
    }
    if (currentPos.x < -mapSizeX) {
      this.actor.threeObject.position.x = -mapSizeX;
    }
    if (currentPos.x > mapSizeX) {
      this.actor.threeObject.position.x = mapSizeX;
    }
  }
}

PlayerBehavior.Y_POSITION = 3;

module.exports = PlayerBehavior;
