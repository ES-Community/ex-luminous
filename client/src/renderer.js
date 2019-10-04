// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const defaultGameRenderer = require("./class/DefaultGameRenderer.js");

const game = new defaultGameRenderer();
game.currentScene.background = new THREE.Color(0xf0f0f0);
game.currentScene.add(new THREE.GridHelper(100, 20));

// Initialize Camera & Controls
game.camera.position.set(500, 800, 1300);
game.camera.lookAt(0, 0, 0);

game.on("update", () => {
  // console.log(game.input.getMouseDelta());
  if (game.input.wasMouseButtonJustReleased(0)) {
    console.log("click !!");
  }
});
