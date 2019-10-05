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


const Player = new Actor("Player");
Player.addScriptedBehavior(new PlayerBehavior());


const currentScene = new Scene();
currentScene.add(Player);
currentScene.scene.background = new THREE.Color(0xf0f0f0);
currentScene.add(new THREE.GridHelper(100, 20));
let plane = FogBehavior.createOrUpdate();
currentScene.scene.add(plane);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
console.log(camera);
camera.name = "Camera";
camera.position.set(50, 50, 0);
camera.lookAt(Player.threeObject.position);

game.init(currentScene, camera);


async function main() {
  const mySound = await SoundPlayer.loadSoundAsset(game.audio, "0218.ogg");

  const offsetCam = new THREE.Vector3(0).add(camera.position).sub(Player.threeObject.position);
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
    const playerPos = Player.threeObject.position;
    const newPos = new THREE.Vector3(0).add(playerPos).add(offsetCam);
    camera.position.set(newPos.x, newPos.y, newPos.z);
    camera.lookAt(Player.threeObject.position);
  });
}
main().catch(console.error);
