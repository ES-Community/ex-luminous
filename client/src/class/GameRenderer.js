"use strict";

// Require Node.js Dependencies
const events = require("events");

// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const Input = require("./Input.js");
const Audio = require("./Audio.js");
const Scene = require("./Scene");

class GameRenderer extends events {
  constructor(mapSize, cubeSize = 16) {
    super();

    this.mapSize = mapSize;
    this.cubeSize = cubeSize;
    this.isInitialized = false;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.objectsToBeDeleted = [];

    const gameElement = document.getElementById("game");
    gameElement.appendChild(this.renderer.domElement);

    this.audio = new Audio();
    this.input = new Input(this.renderer.domElement);
    this.framesPerSecond = 60;
    this.localCache = {
      Orbs: new Map(),
      Grass: new Map(),
      Shadows: new Map(),
      Sounds: new Map()
    };
  }

  tick(accumulatedTime) {
    const updateInterval = (1 / this.framesPerSecond) * 1000;

    // Limit how many update()s to try and catch up,
    // to avoid falling into the "black pit of despair" aka "doom spiral".
    // where every tick takes longer than the previous one.
    // See http://blogs.msdn.com/b/shawnhar/archive/2011/03/25/technical-term-that-should-exist-quot-black-pit-of-despair-quot.aspx
    const maxAccumulatedUpdates = 5;

    const maxAccumulatedTime = maxAccumulatedUpdates * updateInterval;
    if (accumulatedTime > maxAccumulatedTime) {
      accumulatedTime = maxAccumulatedTime;
    }

    // Update
    let updates = 0;
    while (accumulatedTime >= updateInterval) {
      this.update();
      if (this.input.exited) {
        break;
      }
      accumulatedTime -= updateInterval;
      updates++;
    }

    return { updates, timeLeft: accumulatedTime };
  }

  init(currentScene = new Scene(), camera) {
    if (!(camera instanceof THREE.Camera)) {
      throw new TypeError("camera must be an Object that extend from THREE.Camera");
    }
    if (this.isInitialized) {
      return;
    }

    this.lastTimestamp = 0;
    this.accumulatedTime = 0;
    this.renderer.domElement.focus();
    this.currentScene = currentScene;
    this.isInitialized = true;
    this.camera = camera;

    const gameLoop = () => {
      this.tickAnimationFrameId = requestAnimationFrame(gameLoop);
      this.update();
    };

    for (const actor of this.currentScene.actors) {
      actor.triggerBehaviorEvent("awake");
    }
    gameLoop();
    this.resizeRenderer();
    window.onresize = () => this.resizeRenderer();
    setImmediate(() => this.emit("init"));
  }

  update(timestamp = 0) {
    this.input.update();

    this.accumulatedTime += timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    const { timeLeft } = this.tick(this.accumulatedTime);
    this.accumulatedTime = timeLeft;

    if (this.input.exited) {
      this.renderer.clear();
      cancelAnimationFrame(this.tickAnimationFrameId);
      return;
    }

    this.emit("update");
    for (const actor of this.currentScene.actors) {
      actor.triggerBehaviorEvent("update");
    }

    while (this.objectsToBeDeleted.length > 0) {
      const threeObject = this.objectsToBeDeleted.pop();
      this.currentScene.scene.remove(threeObject);
    }
    this.renderer.render(this.currentScene.scene, this.camera);
  }

  resizeRenderer() {
    if (!this.isInitialized) {
      return;
    }

    this.emit("resize");
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

module.exports = GameRenderer;
