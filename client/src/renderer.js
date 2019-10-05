"use strict";

// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const GameRenderer = require("./class/GameRenderer.js");
const Scene = require("./class/Scene");
const Actor = require("./class/Actor");
const SoundPlayer = require("./class/SoundPlayer");

// Require Behaviors
const PlayerBehavior = require("./behaviors/PlayerBehavior");
const FogBehavior = require("./behaviors/FogBehavior");

const game = new GameRenderer();
window.game = game;

// Initialize Camera & Controls
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(500, 800, 1300);
camera.lookAt(0, 0, 0);

const Player = new Actor("Player");
Player.addScriptedBehavior(new PlayerBehavior());

const currentScene = new Scene();
currentScene.add(Player);
currentScene.scene.background = new THREE.Color(0xf0f0f0);
currentScene.add(new THREE.GridHelper(100, 20));
let plane = FogBehavior.createOrUpdate();
currentScene.scene.add(plane);
game.init(currentScene, camera);

async function main() {
  const mySound = await SoundPlayer.loadSoundAsset(game.audio, "0218.ogg");

  game.on("update", () => {
    if (game.input.wasMouseButtonJustReleased(0)) {
      currentScene.scene.remove(plane);
     const mask = [
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 0, 0, 0, 0, 1, 1,
        1, 1, 0, 0, 0, 0, 1, 1,
        1, 1, 0, 1, 1, 0, 1, 1,
        1, 1, 0, 0, 0, 0, 1, 1
      ]
      currentScene.scene.add(FogBehavior.createOrUpdate(mask));
      mySound.play();
    }
  });
}
main().catch(console.error);
