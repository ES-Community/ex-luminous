"use strict";

// Require Third-party Dependencies
const THREE = require("three");

class Camera {
  constructor(Player, startPosition = new THREE.Vector3(50, 120, 0)) {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.name = "Camera";
    this.camera.position.set(startPosition.x, startPosition.y, startPosition.z);

    // Camera properties
    this.rotationSpeed = 0.01;
    this.scrollRange = 10;
    this.timer = 0;
    this.lerpCam = false;
    this.lerpCamDuration = 60;

    // Ref link
    this.currentPosition = this.camera.position;
  }

  update(game, playerPosition, Player) {
    this.camera.lookAt(playerPosition);

    if (game.input.isKeyDown("KeyM") && !this.lerpCam) {
      this.currentPosition = this.camera.position.clone();
      this.lerpCam = true;
    }

    if (this.lerpCam) {
      const factor = this.timer / this.lerpCamDuration;
      this.timer++;

      const x = THREE.Math.lerp(this.currentPosition.x, this.currentPosition.x + this.scrollRange, factor);
      const y = THREE.Math.lerp(this.currentPosition.y, this.currentPosition.y + this.scrollRange, factor);

      this.camera.position.set(x, y, 0);
      if (this.timer === this.lerpCamDuration) {
        this.lerpCam = false;
        this.timer = 0;
      }
    }

    if (game.input.isMouseButtonDown(2)) {
      const mouseDelta = game.input.mouseDelta;
      // game.input.lockMouse();
      Player.threeObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -mouseDelta.x * this.rotationSpeed);
    }
    if (game.input.wasMouseButtonJustReleased(2)) {
      // game.input.unlockMouse();
    }
  }
}

module.exports = Camera;
