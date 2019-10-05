"use strict";

// Require Third-party Dependencies
const THREE = require("three");
window.THREE = THREE;
require("three/examples/js/controls/OrbitControls");

// Require Internal Dependencies
const GameRenderer = require("./class/GameRenderer.js");
const Scene = require("./class/Scene");
const Actor = require("./class/Actor");
const grpc = require("./grpc.js");

// Require Behaviors
const PlayerBehavior = require("./behaviors/PlayerBehavior");
const FogBehavior = require("./behaviors/FogBehavior");
const GridBehavior = require("./behaviors/GridBehavior");

async function start(server, name) {
  const grpcClient = grpc.createClient(server);
  grpcClient.connect({ name }, function(err) {
    if (err) {
      // TODO: retry connection ?
    }

    const gameDataStream = grpcClient.gameData({});
    initializeGameRenderer(gameDataStream);

    // setInterval(() => {
    //   gameDataStream.write({ type: "player-moved", data: JSON.stringify({ x: 1, z: 2 }) });
    // }, 1000);
  });
}

function initializeGameRenderer(gameDataStream) {
  const game = new GameRenderer();
  window.game = game;

  // Initialize Camera & Controls
  const Player = new Actor("Player");
  Player.addScriptedBehavior(new PlayerBehavior());

  const currentScene = new Scene();
  currentScene.add(Player);
  currentScene.scene.background = new THREE.Color(0xf0f0f0);

  const mask = [
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    1
  ];
  let plane = FogBehavior.createOrUpdate(mask);
  currentScene.add(plane);

  function animate() {
    requestAnimationFrame(animate);

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    camera.lookAt(Player.threeObject.position);
    game.renderer.render(currentScene.scene, camera);
  }

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.name = "Camera";
  camera.position.set(50, 50, 0);

  // Rotation controls
  let controls = new THREE.OrbitControls(camera, game.renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.0005;
  controls.enableKeys = false;
  controls.rotateSpeed = 1;
  controls.mouseButtons = { ORBIT: THREE.MOUSE.MIDDLE, ZOOM: THREE.MOUSE.RIGHT, PAN: THREE.MOUSE.LEFT };
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  camera.lookAt(Player.threeObject.position);
  game.init(currentScene, camera);
  gameDataStream.on("data", (data) => {
    const parsedData = JSON.parse(data.data);
    console.log("received data from server", parsedData);
    game.emit("server-data", data.type, parsedData);
  });

  const offsetCam = new THREE.Vector3(0).add(camera.position).sub(Player.threeObject.position);
  animate();

  GridBehavior.generateGrid(10, 10, currentScene.scene);

  let index = 0;
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

  return game;
}

module.exports = {
  start
};
