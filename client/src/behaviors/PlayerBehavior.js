"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class PlayerBehavior extends ScriptBehavior {
  constructor(canMove) {
    super(canMove);
    this.canMove = canMove;
  }
  static CreateMesh(color = 0xffff00) {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: false,
      opacity: 0.5
    });
    return new THREE.Mesh(geometry, material);
  }

  static PosToVector3(pos) {
    const yPos = game.cubeSize + 1;

    return new THREE.Vector3(pos.x * game.cubeSize, yPos, pos.z * game.cubeSize);
  }

  awake() {
    const currentPos = this.actor.threeObject.position;
    this.actor.setGlobalPosition(new THREE.Vector3(currentPos.x, PlayerBehavior.Y_POSITION, currentPos.z));

    this.speed = 1;
    this.radiusLight = 4;
    const light = new THREE.PointLight(0xffffff, 6.5, this.radiusLight * game.cubeSize, 5);
    light.position.set(0, 1, 0);
    game.modelLoader.load("Orb", "Orb.png").then((model) => {
      model.scale.set(1.5, 1.5, 1.5);
      this.actor.threeObject.add(model);
      this.actor.threeObject.add(light);
    });
  }

  update() {
    const cubeMiddleSize = game.cubeSize / 2;
    const mapSizeZ = game.mapSize.z * game.cubeSize;
    const mapSizeX = game.mapSize.x * game.cubeSize;
    if (this.canMove) {
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
    }

    const currentPos = this.actor.threeObject.position.clone();
    const maxSizeZ = mapSizeZ - cubeMiddleSize;
    const maxSizeX = mapSizeX - cubeMiddleSize;
    if (currentPos.z < -cubeMiddleSize) {
      this.actor.threeObject.position.z = -cubeMiddleSize;
    }
    if (currentPos.z > maxSizeZ) {
      this.actor.threeObject.position.z = maxSizeZ;
    }
    if (currentPos.x < -cubeMiddleSize) {
      this.actor.threeObject.position.x = -cubeMiddleSize;
    }
    if (currentPos.x > maxSizeX) {
      this.actor.threeObject.position.x = maxSizeX;
    }
  }
}

PlayerBehavior.Y_POSITION = 3;

module.exports = PlayerBehavior;
