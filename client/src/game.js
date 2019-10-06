"use strict";

// Require Third-party Dependencies
const { remote } = require("electron");
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
  const fadeTxt = document.getElementById("fade-txt");
  const fadeSpan = document.getElementById("fade-span");
  const closeWindowBtn = document.getElementById("close-window");
  const grpcClient = grpc.createClient(server);

  let connectionPayload = null;
  const closeListener = () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
  };
  closeWindowBtn.addEventListener("click", closeListener);

  // eslint-disable-next-line
  while (1) {
    connectionPayload = await new Promise((resolve) => {
      grpcClient.connect({ name }, function(err, data = defaultData) {
        if (err) {
          fadeTxt.innerHTML = `💀 ${err.message}`;
          fadeSpan.style.display = "block";
          resolve(null);
        } else {
          resolve(data);
        }
      });
    });
    if (connectionPayload !== null) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
    fadeSpan.style.display = "none";
    fadeTxt.innerHTML = `🕐 Connection in progress to <b>${server}</b>`;
  }

  if (connectionPayload.ok) {
    closeWindowBtn.removeEventListener("click", closeListener);
    closeWindowBtn.classList.add("hide");
    fadeTxt.innerHTML = `🚀 Loading and generating game assets`;

    const { mapSize } = JSON.parse(connectionPayload.data);
    const gameDataStream = grpcClient.gameData({});
    initializeGameRenderer(gameDataStream, mapSize, name);
  } else {
    fadeTxt.innerHTML = `❌ ${connectionPayload.reason}`;
  }
}

function createOrb(currentScene, orbs) {
  const orbsActor = new Actor(`orbs_${orbs.id}`);
  const orbsColor = new THREE.Color(0xffffff);
  orbsColor.setHex(Math.random() * 0xffffff);
  const orbsMesh = PlayerBehavior.CreateMesh(orbsColor);

  orbsActor.setGlobalPosition(PlayerBehavior.PosToVector3(orbs.position));
  orbsActor.threeObject.add(orbsMesh);
  currentScene.add(orbsActor);

  return orbsActor;
}

function createGrass(currentScene, grass) {
  const grassActor = new Actor(`grass_${grass.id}`);
  const grassPosition = new THREE.Vector2(grass.position.x, grass.position.z);

  grassActor.addScriptedBehavior(new GrassBehavior(grassPosition));
  currentScene.add(grassActor);

  return grassActor;
}

function initializeGameRenderer(gameDataStream, mapSize, playerName) {
  let isFirstGameData = true;

  const game = new GameRenderer();
  game.modelLoader = new ModelLoader({
    modelsPath: "../assets/models/",
    texturePath: "../assets/textures/"
  });
  game.mapSize = mapSize;
  window.game = game;

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

  // Initialize Camera & Controls
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.name = "Camera";
  camera.position.set(50, 50, 0);
  camera.lookAt(Player.threeObject.position);
  currentScene.add(camera);
  Player.threeObject.add(camera);

  gameDataStream.on("data", ({ type, data }) => {
    const payload = JSON.parse(data);
    if (isFirstGameData && type === "currentState") {
      isFirstGameData = false;

      for (const grass of payload.grass) {
        game.localCache.Grass.set(grass.id, createGrass(currentScene, grass));
      }
      for (const orbs of payload.orbs) {
        if (orbs.name === playerName) {
          game.localCache.Orbs.set(orbs.id, Player);
          Player.setGlobalPosition(PlayerBehavior.PosToVector3(orbs.position));
        } else {
          game.localCache.Orbs.set(orbs.id, createOrb(currentScene, orbs));
        }
      }

      game.init(currentScene, camera);
      game.renderer.domElement.focus();
      // game.input.lockMouse();
      setTimeout(() => {
        document.getElementById("fade").classList.add("hide");
      }, 500);

      return;
    } else if (type === "currentState") {
      for (const orbs of payload.orbs) {
        if (game.localCache.Orbs.has(orbs.id)) {
          if (orbs.name === playerName) {
            continue;
          }

          /** @type {Actor} */
          const orbActor = game.localCache.Orbs.get(orbs.id);
          const newPosition = PlayerBehavior.PosToVector3(orbs.position);
          orbActor.setGlobalPosition(newPosition);
        } else {
          game.localCache.Orbs.set(orbs.id, createOrb(currentScene, orbs));
        }
      }

      for (const grass of payload.grass) {
        if (!game.localCache.Grass.has(grass.id)) {
          game.localCache.Grass.set(grass.id, createGrass(currentScene, grass));
        }
      }
    }

    // emit to the game renderer
    game.emit("data", type, payload);
  });

  for (const cube of GridBehavior.generateGridEx(mapSize.x, mapSize.z)) {
    currentScene.add(cube);
  }

  let rotationSpeed = 0.01;
  let scrollRange = 10;
  let timer = 0;
  let lerpCam = false;
  let lerpCamDuration = 60;
  let cameraPosition = camera.position;
  game.on("update", () => {
    const playerPos = Player.threeObject.position;

    gameDataStream.write({ type: "player-moved", data: JSON.stringify({ x: playerPos.x, z: playerPos.z }) });
    camera.lookAt(Player.threeObject.position);
    if (game.input.wasMouseButtonJustReleased(0)) {
      currentScene.scene.remove(plane);
      plane = FogBehavior.createOrUpdate(mask, mapSize.x * 4, mapSize.z * 4);
      currentScene.add(plane);
    }
    if (game.input.isKeyDown("KeyM")) {
      if (lerpCam === false) {
        cameraPosition = camera.position.clone();
        lerpCam = true;
      }
    }

    if (lerpCam === true) {
      const factor = timer / lerpCamDuration;
      timer++;

      const x = THREE.Math.lerp(cameraPosition.x, cameraPosition.x + scrollRange, factor);
      const y = THREE.Math.lerp(cameraPosition.y, cameraPosition.y + scrollRange, factor);

      camera.position.set(x, y, 0);
      if (timer === lerpCamDuration) {
        lerpCam = false;
        timer = 0;
      }
    }

    if (game.input.isMouseButtonDown(2)) {
      const mouseDelta = game.input.mouseDelta;
      Player.threeObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -mouseDelta.x * rotationSpeed);
    }
  });
}

module.exports = {
  start
};
