"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class PlayerBehavior extends ScriptBehavior {
  constructor(canMove = true) {
    super();
    this.canMove = canMove;
  }
  static CreateMesh(color = 0xc4c2ad) {
    const geometry = new THREE.SphereBufferGeometry(3, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      metalness: 1,
      side: THREE.BackSide
    });
    material.needsUpdate = true;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 2, 0);
    return mesh;
  }

  static CreateLight(radius = 4) {
    const light = new THREE.PointLight(0xffffff, 6.5, radius * game.cubeSize, 5);
    light.position.set(0, 1, 0);
    return light;
  }

  static PosToVector3(pos) {
    const yPos = game.cubeSize + 1;

    return new THREE.Vector3(pos.x * game.cubeSize, yPos, pos.z * game.cubeSize);
  }

  static PosToVector3Ex(pos) {
    return new THREE.Vector3(pos.x * game.cubeSize, 2, pos.z * game.cubeSize);
  }

  awake() {
    const currentPos = this.actor.threeObject.position;
    this.actor.setGlobalPosition(new THREE.Vector3(currentPos.x, 2, currentPos.z));

    this.speed = 0.45;

    this.radiusLight = 80;
    this.light = new THREE.PointLight(0x282208, 2, this.radiusLight * 4, 10);
    // this.light.castShadow = true;
    // this.light.power = 100;
    this.light.position.set(0, 2, 0);
    this.actor.threeObject.add(this.light);
    // game.modelLoader.load("Orb", "Orb.png").then((model) => {
    //   this.actor.threeObject.add(model);
    //   this.actor.threeObject.add(this.light);
    // });
    const player = PlayerBehavior.CreateMesh();
    this.actor.threeObject.add(player);
    this.timer = 0;
    this.lightPulseDuration = 120;
  }

  update() {
    const speedMove = 0.01;
    const range = 1;
    this.light.intensity = Math.cos(this.timer * speedMove * 2) * range + 4;
    // this.light.position.y = Math.cos(this.timer * speedMove ) + 2
    // this.light.position.x = Math.cos(this.timer * speedMove) * range
    // this.light.position.z = Math.sin(this.timer * speedMove) * range

    const cubeMiddleSize = game.cubeSize / 2;
    const mapSizeZ = game.mapSize.z * game.cubeSize - 1;
    const mapSizeX = game.mapSize.x * game.cubeSize - 1;
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

    this.timer++;
  }
}

PlayerBehavior.Y_POSITION = 1;

module.exports = PlayerBehavior;
