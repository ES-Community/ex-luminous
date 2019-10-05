"use strict";

// Require Third-party Dependencies
const THREE = require("three");
window.THREE = THREE;
require("three/examples/js/controls/OrbitControls");

// Require Internal Dependencies
const GameRenderer = require("./class/GameRenderer.js");
const ModelLoader = require("./class/ModelLoader");
const Scene = require("./class/Scene");
const Actor = require("./class/Actor");
const grpc = require("./grpc.js");

// Require Behaviors
const PlayerBehavior = require("./behaviors/PlayerBehavior");
const FogBehavior = require("./behaviors/FogBehavior");
const GridBehavior = require("./behaviors/GridBehavior");
const GrassBehavior = require("./behaviors/GrassBehavior");

// Variables
const defaultData = { data: JSON.stringify({ mapSize: { x: 64, z: 64 } }) };

async function start(server, name) {
  const grpcClient = grpc.createClient(server);
  grpcClient.connect({ name }, function(err, data = defaultData) {
    if (err) {
      // TODO: retry connection ?
      // console.log(data.reason);
    }

    const { mapSize } = JSON.parse(data.data);
    const gameDataStream = grpcClient.gameData({});
    initializeGameRenderer(gameDataStream, mapSize);
  });
}

function initializeGameRenderer(gameDataStream, mapSize) {
  let isFirstGameData = true;

  const game = new GameRenderer();
  game.modelLoader = new ModelLoader({
    modelsPath: "../assets/models/",
    texturePath: "../assets/textures/"
  });
  window.game = game;

  // Initialize Camera & Controls
  const Player = new Actor("Player");
  Player.addScriptedBehavior(new PlayerBehavior());

  const currentScene = new Scene();
  currentScene.add(Player);
  currentScene.add(new THREE.AmbientLight(0x606060));
  currentScene.scene.background = new THREE.Color(0, 0, 0);

  const mask = [];
  for (let i = 0; i < mapSize.x * mapSize.z; i++) {
    // mask.push(Math.random() > 0.3 ? 1 : 0);
    mask.push(0);
  }
  let plane = FogBehavior.createOrUpdate(mask, mapSize.x * 4, mapSize.z * 4);
  currentScene.add(plane);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.name = "Camera";
  camera.position.set(50, 50, 0);

  camera.lookAt(Player.threeObject.position);
  gameDataStream.on("data", ({ type, data }) => {
    const payload = JSON.parse(data);
    if (isFirstGameData && type === "currentState") {
      isFirstGameData = false;
      // TODO: init game state
      const { grass: grassList } = payload;
      for (const grass of grassList) {
        const grassActor = new Actor(`grass_${grass.id}`);
        const grassPosition = new THREE.Vector2(grass.position.x, grass.position.z);

        grassActor.addScriptedBehavior(new GrassBehavior(grassPosition));
        game.localCache.Grass.set(grass.id, grassActor);
        currentScene.add(grassActor);
      }
      game.init(currentScene, camera);

      return;
    }

    // emit to the game renderer
    game.emit("data", type, payload);
  });

  const offsetCam = new THREE.Vector3(0).add(camera.position).sub(Player.threeObject.position);

  for (const cube of GridBehavior.generateGridEx(mapSize.x, mapSize.z)) {
    currentScene.add(cube);
  }

  game.on("update", () => {
    const playerPos = Player.threeObject.position;

    gameDataStream.write({ type: "player-moved", data: JSON.stringify({ x: playerPos.x, z: playerPos.z }) });
    const newPos = new THREE.Vector3(0).add(playerPos).add(offsetCam);
    camera.position.set(newPos.x, newPos.y, newPos.z);
    camera.lookAt(Player.threeObject.position);
  });
}

module.exports = {
  start
};
