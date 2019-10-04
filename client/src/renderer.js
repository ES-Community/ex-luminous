// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const DefaultGameRenderer = require("./class/DefaultGameRenderer.js");
const Scene = require("./class/Scene");
const Actor = require("./class/Actor");

// Require Behaviors
const PlayerBehavior = require("./behaviors/PlayerBehavior");

const game = new DefaultGameRenderer();
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

game.init(currentScene, camera);

game.on("update", () => {
  if (game.input.wasMouseButtonJustReleased(0)) {
    console.log("click !!");
  }
});
