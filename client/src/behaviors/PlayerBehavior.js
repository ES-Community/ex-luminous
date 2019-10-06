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
    return new THREE.Vector3(pos.x * game.cubeSize, PlayerBehavior.Y_POSITION, pos.z * game.cubeSize);
  }

  awake() {
    this.actor.setGlobalPosition(new THREE.Vector3(0, PlayerBehavior.Y_POSITION, 0));
    this.speed = 0.3;
    this.radiusLight = 20;
    const light = new THREE.PointLight(0xffffff, 5, this.radiusLight * 4);
    light.position.set(0, 1, 0);
    game.modelLoader.load("Orb", "Orb.png").then((model) => {
      this.actor.threeObject.add(model);
      this.actor.threeObject.add(light);
    });
  }

  update() {
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
    // console.log(currentPos);
    if (currentPos.z < 0) {
      this.actor.threeObject.position.z = 0;
    }
    if (currentPos.z > mapSizeZ) {
      this.actor.threeObject.position.z = mapSizeZ;
    }
    if (currentPos.x < 0) {
      this.actor.threeObject.position.x = 0;
    }
    if (currentPos.x > mapSizeX) {
      this.actor.threeObject.position.x = mapSizeX;
    }

    // currentPos.x -= currentPos.x % 4;
    // currentPos.z -= currentPos.z % 4;
    // // console.log(currentPos);
    // const [xMin, xMax, zMin, zMax] = [
    //   currentPos.x - this.radiusLight * 4,
    //   currentPos.x + this.radiusLight * 4,
    //   currentPos.z - this.radiusLight * 4,
    //   currentPos.z + this.radiusLight * 4
    // ];

    // // reset mask full black
    // for (const arr of mask) {
    //   for (let i = 0; i < arr.length - 1; i++) {
    //     arr[i] = 1;
    //   }
    // }

    // for (let x = xMin; x < xMax; x+=4) {
    //   for (let z = zMin; z < zMax; z+=4) {
    //     const dx = currentPos.x - x;
    //     const dz = currentPos.z - z;
    //     const distance = Math.sqrt( dx * dx + dz * dz );
    //     if (distance < this.radiusLight * 4) {
    //       mask[game.mapSize.z/2 + z/4][game.mapSize.x/2 + x/4] = 0;
    //     }
    //   }
    // }
  }
}

PlayerBehavior.Y_POSITION = 3;

module.exports = PlayerBehavior;
