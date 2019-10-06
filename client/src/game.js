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

function updateGrass(actor, state, grassTexture, scene) {
  switch (state) {
    case "NORMAL": {
      updateMeshTexture(actor, grassTexture[0]);
      updateLight(actor, "remove");
      break;
    }
    case "LIGHT": {
      updateMeshTexture(actor, grassTexture[1]);
      updateLight(actor, "add");
      break;
    }
    case "LOADING": {
      break;
    }
    case "UNLOADING": {
      break;
    }
    case "BLOOM": {
      break;
    }
    case "WOUNDED": {
      break;
    }
    case "DEAD": {
      scene.remove(actor.threeObject);
      break;
    }
  }
}

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
    const meta = new grpc.Metadata();
    meta.add("name", name);
    const gameDataStream = grpcClient.gameData(meta, { deadline: Infinity });
    initializeGameRenderer(gameDataStream, mapSize, name);
  } else {
    fadeTxt.innerHTML = `❌ ${connectionPayload.reason}`;
  }
}
function updateMeshTexture(actor, texture) {
  actor.threeObject.traverse(function(obj) {
    if (obj instanceof THREE.Mesh) {
      if (obj.material.map == texture) {
        return;
      } else {
        obj.material.map = texture;
        obj.material.needsUpdate = true;
      }
    }
  });
}
function updateLight(actor, type) {
  if (type == "remove") {
    if (actor.threeObject.children[1] instanceof THREE.PointLight) {
      actor.threeObject.children[1].visible = false;
    }
  } else if (type == "add") {
    if (actor.threeObject.children[1] instanceof THREE.PointLight) {
      actor.threeObject.children[1].visible = true;
    }
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

function createShadow(currentScene, shadows) {
  const shadowsActor = new Actor(`shadows_${shadows.id}`);
  const shadowsColor = new THREE.Color("red");
  const shadowsMesh = PlayerBehavior.CreateMesh(shadowsColor);

  shadowsActor.setGlobalPosition(PlayerBehavior.PosToVector3(shadows.position));
  shadowsActor.threeObject.add(shadowsMesh);
  currentScene.add(shadowsActor);

  return shadowsActor;
}

function createGrass(currentScene, grass) {
  const grassActor = new Actor(`grass_${grass.id}`);
  const grassPosition = new THREE.Vector2(grass.position.x, grass.position.z);

  grassActor.addScriptedBehavior(new GrassBehavior(grassPosition));
  currentScene.add(grassActor);

  return grassActor;
}

async function initializeGameRenderer(gameDataStream, mapSize, playerName) {
  let isFirstGameData = true;

  const game = new GameRenderer();
  game.modelLoader = new ModelLoader({
    modelsPath: "../assets/models/",
    texturePath: "../assets/textures/"
  });
  game.mapSize = mapSize;
  window.game = game;

  const currentScene = new Scene();
  const color = 0xff0000;
  const intensity = 0;
  // const light = new THREE.AmbientLight(color, intensity);
  // currentScene.add(new THREE.AmbientLight(0x606060));
  currentScene.background = new THREE.Color("black");
  // currentScene.add(light);

  // let mask = [];
  // for (let i = 0; i < mapSize.x; i++) {
  //   // mask.push(Math.random() > 0.3 ? 1 : 0);
  //   const col = [];
  //   for (let j = 0; j < mapSize.z; j++) {
  //     col.push(1);
  //   }
  //   mask.push(col);
  // }
  // window.mask = mask;
  // let plane = FogBehavior.createOrUpdate(mask.flat(), mapSize.x, mapSize.z);
  // currentScene.add(plane);

  const Player = new Actor("Player");
  Player.addScriptedBehavior(new PlayerBehavior());

  currentScene.add(Player);

  // Initialize Camera & Controls
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.name = "Camera";
  camera.position.set(50, 50, 0);
  camera.lookAt(Player.threeObject.position);
  currentScene.add(camera);
  Player.threeObject.add(camera);
  const grassTexture = [
    await game.modelLoader.loadTexture("Herbe_Neutre.png"),
    await game.modelLoader.loadTexture("Herbe_Verte.png")
  ];

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
      for (const shadow of payload.shadows) {
        game.localCache.Shadows.set(shadow.id, createShadow(currentScene, shadow));
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

      for (const shadows of payload.shadows) {
        if (game.localCache.Shadows.has(shadows.id)) {
          /** @type {Actor} */
          const shadowActor = game.localCache.Shadows.get(shadows.id);
          const newPosition = PlayerBehavior.PosToVector3(shadows.position);
          shadowActor.setGlobalPosition(newPosition);
        } else {
          game.localCache.Shadows.set(shadows.id, createShadow(currentScene, shadows));
        }
      }

      for (const grass of payload.grass) {
        if (!game.localCache.Grass.has(grass.id)) {
          game.localCache.Grass.set(grass.id, createGrass(currentScene, grass));
        }
        if (game.localCache.Grass.has(grass.id)) {
          /** @type {Actor} */
          const grassActor = game.localCache.Grass.get(grass.id);
          updateGrass(grassActor, grass.state, grassTexture, currentScene.scene);
        }
      }
    } else if (type === "grass-dead") {
      /** @type {Actor} */
      const grassActor = game.localCache.Grass.get(payload.id);
      updateGrass(grassActor, "DEAD", grassTexture, currentScene.scene);
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
    // const maxPos

    gameDataStream.write({ type: "player-moved", data: JSON.stringify({ x: playerPos.x, z: playerPos.z }) });
    camera.lookAt(Player.threeObject.position);
    // if (game.input.wasMouseButtonJustReleased(0)) {
    // currentScene.scene.remove(plane);
    // plane = FogBehavior.createOrUpdate(mask.flat(), mapSize.x, mapSize.z);
    // currentScene.add(plane);
    // }
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
      // game.input.lockMouse();
      Player.threeObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -mouseDelta.x * rotationSpeed);
    }
    if (game.input.wasMouseButtonJustReleased(2)) {
      // game.input.unlockMouse();
    }
  });
}

module.exports = {
  start
};
