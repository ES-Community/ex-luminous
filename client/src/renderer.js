// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const defaultGameRenderer = require("./class/DefaultGameRenderer.js");

const game = new defaultGameRenderer();

// Initialize Camera & Controls
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(500, 800, 1300);
camera.lookAt(0, 0, 0);

const currentScene = new THREE.Scene();
currentScene.background = new THREE.Color(0xf0f0f0);
currentScene.add(new THREE.GridHelper(100, 20));

game.init(currentScene, camera);

game.on("update", () => {
  // console.log(game.input.getMouseDelta());
  if (game.input.wasMouseButtonJustReleased(0)) {
    console.log("click !!");
  }
});
