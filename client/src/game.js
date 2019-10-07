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
const SoundPlayer = require("./class/SoundPlayer");
const { updateLight, updateMeshTexture } = require("./utils");
const grpc = require("./grpc.js");

// Require Behaviors
const PlayerBehavior = require("./behaviors/PlayerBehavior");
const GridBehavior = require("./behaviors/GridBehavior");
const GrassBehavior = require("./behaviors/GrassBehavior");

function updateGrass(actor, currentBehavior, grassTexture, scene) {
  switch (currentBehavior) {
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

function updatePlayer(actor, currentBehavior, orbTexture) {
  switch (currentBehavior) {
    case "NORMAL": {
      // updateMeshTexture(actor, orbTexture[0]);
      break;
    }
    case "HUNTED": {
      // updateMeshTexture(actor, orbTexture[1]);
      break;
    }
    case "WOUNDED": {
      break;
    }
    case "DEAD": {
      // const playerPosition = actor.threeObject.position;
      // scene.remove(actor.threeObject);
      // const orbsColor = new THREE.Color("grey");
      // const playerBehavior = new PlayerBehavior(false);
      // const orbsMesh = playerBehavior.CreateMesh(orbsColor);
      // orbsActor.setGlobalPosition(playerBehavior.PosToVector3(playerPosition));
      // actor.threeObject.add(orbsMesh);
      // scene.add(actor);
      break;
    }
    case "RESPAWN": {
      // do some animation for the respawn and then emit a gameStream
      game.gameDataStream.write({
        type: "player-hasRespawn"
      });
      break;
    }
  }
}

async function start() {
  window.grpcClient = grpc.createClient(server);

  const backToLobbyBtn = document.getElementById("back-lobby");
  let lobbyListener;
  if (!isHost) {
    backToLobbyBtn.style.display = "flex";
    lobbyListener = () => {
      const currentWindow = remote.getCurrentWindow();
      currentWindow.loadURL(`file://${__dirname}/../views/lobby.html`);
    };
    backToLobbyBtn.addEventListener("click", lobbyListener);
  }

  // Setup close button
  const closeWindowBtn = document.getElementById("close-window");
  const closeListener = () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
  };
  closeWindowBtn.addEventListener("click", closeListener);

  // Attempt to connect on the server
  const connectionPayload = await grpc.lobbyConnectionAttempt(grpcClient);

  const fadeTxt = document.getElementById("fade-txt");
  if (connectionPayload.ok) {
    closeWindowBtn.removeEventListener("click", closeListener);
    closeWindowBtn.classList.add("hide");
    if (!isHost) {
      backToLobbyBtn.classList.add("hide");
      backToLobbyBtn.removeEventListener("click", lobbyListener);
    }
    fadeTxt.innerHTML = `🚀 Loading and generating game assets`;

    const { mapSize } = JSON.parse(connectionPayload.data);
    const meta = new grpc.Metadata();
    meta.add("name", playerName);

    const gameDataStream = grpcClient.gameData(meta, { deadline: Infinity });
    gameDataStream.on("error", reconnectAndResetGame);
    gameDataStream.on("end", reconnectAndResetGame);

    initializeGameRenderer(gameDataStream, mapSize, playerName);
  } else {
    fadeTxt.innerHTML = `❌ ${connectionPayload.reason}`;
  }
}

async function reconnectAndResetGame() {
  const fadeTxt = document.getElementById("fade-txt");
  fadeTxt.innerHTML = `🕐 Connection in progress to <b>${server}</b>`;
  document.getElementById("fade").classList.remove("hide");
  document.getElementById("close-window").classList.remove("hide");

  if (game instanceof GameRenderer) {
    if (typeof game.currentScene !== "undefined") {
      game.currentScene.clear();
    }

    game.renderer.clear();
    game = null;
    document.getElementById("game").innerHTML = "";
  }

  await start();
}

function createOrb(currentScene, orbs) {
  const orbsActor = new Actor(`orbs_${orbs.id}`);
  const orbsColor = new THREE.Color(0xffffff);
  orbsColor.setHex(Math.random() * 0xffffff);
  const orbsMesh = PlayerBehavior.CreateMesh(orbsColor);

  orbsActor.setGlobalPosition(PlayerBehavior.PosToVector3(orbs.position));
  orbsActor.threeObject.add(orbsMesh);
  orbsActor.threeObject.add(PlayerBehavior.CreateLight(4));
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
  const grassPosition = PlayerBehavior.PosToVector3(grass.position);

  grassActor.addScriptedBehavior(new GrassBehavior(grassPosition));
  currentScene.add(grassActor);

  return grassActor;
}

async function initializeGameRenderer(gameDataStream, mapSize, playerName) {
  let isFirstGameData = true;

  window.game = new GameRenderer();
  game.modelLoader = new ModelLoader({
    modelsPath: "../assets/models/",
    texturePath: "../assets/textures/"
  });
  game.mapSize = mapSize;
  game.cubeSize = 16;
  game.gameDataStream;
  GridBehavior.cubeSize = game.cubeSize;

  // const mySound = SoundPlayer.loadSoundAsset(game.audio, "O218.ogg", { loop: true });
  // game.on("init", () => {
  //   mySound.play();
  // });

  const currentScene = new Scene();
  currentScene.background = new THREE.Color("black");

  const Player = new Actor("Player");
  Player.addScriptedBehavior(new PlayerBehavior(true));
  currentScene.add(Player);

  // Initialize Camera & Controls
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.name = "Camera";
  camera.position.set(50, 120, 0);
  camera.lookAt(Player.threeObject.position);
  currentScene.add(camera);
  Player.threeObject.add(camera);

  const grassTexture = [
    await game.modelLoader.loadTexture("Herbe_Neutre.png"),
    await game.modelLoader.loadTexture("Herbe_Verte.png")
  ];
  const orbTexture = [
    await game.modelLoader.loadTexture("Orb.png"),
    await game.modelLoader.loadTexture("Orb_Detect.png")
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

      game.renderer.domElement.focus();
      game.init(currentScene, camera);
      // game.input.lockMouse();
      setTimeout(() => {
        document.getElementById("fade").classList.add("hide");
      }, 200);

      return;
    } else if (type === "currentState") {
      for (const orb of payload.orbs) {
        if (game.localCache.Orbs.has(orb.id)) {
          const orbActor = game.localCache.Orbs.get(orb.id);
          if (orbActor.currentBehavior !== orb.currentBehavior) {
            orbActor.currentBehavior = orb.currentBehavior;
            updatePlayer(orbActor, orb.currentBehavior, orbTexture, currentScene.scene);
          }
          if (orb.name === playerName) {
            continue;
          }

          const newPosition = PlayerBehavior.PosToVector3(orb.position);
          orbActor.setGlobalPosition(newPosition);
        } else {
          game.localCache.Orbs.set(orb.id, createOrb(currentScene, orb));
        }
      }

      for (const shadows of payload.shadows) {
        if (game.localCache.Shadows.has(shadows.id)) {
          const shadowActor = game.localCache.Shadows.get(shadows.id);
          const newPosition = PlayerBehavior.PosToVector3(shadows.position);
          shadowActor.setGlobalPosition(newPosition);
        } else {
          game.localCache.Shadows.set(shadows.id, createShadow(currentScene, shadows));
        }
      }

      for (const grass of payload.grass) {
        if (game.localCache.Grass.has(grass.id)) {
          /** @type {Actor} */
          const grassActor = game.localCache.Grass.get(grass.id);

          if (grassActor.currentBehavior !== grass.currentBehavior) {
            grassActor.currentBehavior = grass.currentBehavior;
            updateGrass(grassActor, grass.currentBehavior, grassTexture, currentScene.scene);
          }
        } else {
          game.localCache.Grass.set(grass.id);
        }
      }
    } else if (type === "grass-dead") {
      /** @type {Actor} */
      const grassActor = game.localCache.Grass.get(payload.id);
      updateGrass(grassActor, "DEAD", grassTexture, currentScene.scene);
    } else if (type === "player-respawn") {
      /** @type {Actor} */
      const playerActor = game.localCache.Orbs.get(payload.id);
      updatePlayer(playerActor, "RESPAWN", orbTexture);
    }
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
    const playerPos = Player.threeObject.position.clone();
    gameDataStream.write({
      type: "player-moved",
      data: JSON.stringify({ x: playerPos.x / game.cubeSize, z: playerPos.z / game.cubeSize })
    });
    camera.lookAt(Player.threeObject.position);

    if (game.input.isKeyDown("KeyM") && !lerpCam) {
      cameraPosition = camera.position.clone();
      lerpCam = true;
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
