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
const GridBehavior = require("./behaviors/GridBehavior");

const game = new GameRenderer();
window.game = game;

// Initialize Camera & Controls
const Player = new Actor("Player");
Player.addScriptedBehavior(new PlayerBehavior());


const currentScene = new Scene();
currentScene.add(Player);
currentScene.scene.background = new THREE.Color(0xf0f0f0);
currentScene.add(new THREE.GridHelper(100, 20));

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
let plane = FogBehavior.createOrUpdate(mask);
currentScene.add(plane);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
console.log(camera);
camera.name = "Camera";
camera.position.set(50, 50, 0);

camera.lookAt(Player.threeObject.position);
game.init(currentScene, camera);

let index = 0;
async function main() {
  const mySound = await SoundPlayer.loadSoundAsset(game.audio, "0218.ogg");

  const offsetCam = new THREE.Vector3(0).add(camera.position).sub(Player.threeObject.position);
  GridBehavior.generateGrid(10, 10, currentScene.scene);
  game.on("update", () => {
    if (game.input.wasMouseButtonJustReleased(0)) {
      mask[index] = 0;
      index++;
      currentScene.scene.remove(plane);
      plane = FogBehavior.createOrUpdate(mask);
      currentScene.add(plane);
      //mySound.play();
    }
    const playerPos = Player.threeObject.position;
    const newPos = new THREE.Vector3(0).add(playerPos).add(offsetCam);
    camera.position.set(newPos.x, newPos.y, newPos.z);
    camera.lookAt(Player.threeObject.position);
  });
}
main().catch(console.error);
