"use strict";

// Require Third-party Dependencies
const { remote } = require("electron");
const THREE = require("three");
window.THREE = THREE;

// Require Internal Dependencies
const GameRenderer = require("./class/GameRenderer.js");
const ModelLoader = require("./class/ModelLoader");
const Scene = require("./class/Scene");
const Actor = require("./class/Actor");
const Audio = require("./class/Audio");
const Camera = require("./class/Camera");
const Timer = require("./class/Timer");
const SoundPlayer = require("./class/SoundPlayer");
const { updateLight, updateMeshTexture } = require("./utils");
const grpc = require("./grpc.js");

// Require Behaviors
const PlayerBehavior = require("./behaviors/PlayerBehavior");
const GridBehavior = require("./behaviors/GridBehavior");
const GrassBehavior = require("./behaviors/GrassBehavior");
const LightBehavior = require("./behaviors/LightBehavior");

// Variables
const modelsPath = __dirname + "/../assets/models/";
const texturePath = __dirname + "/../assets/textures/";
const texturesAssets = ["Herbe_Neutre.png", "Herbe_Verte.png", "Orb.png", "Orb_Detect.png"];
const dummyData = "null";
const globalAudio = new Audio();
let isGuiButtonsSetup = false;
let isRestartButtonSetup = false;
let connectedOnce = false;
let mapSize;

function updateGrass(actor, currentBehavior, grassTexture) {
  switch (currentBehavior) {
    case "NORMAL": {
      updateMeshTexture(actor, grassTexture[0]);
      updateLight(actor, "remove");
      break;
    }
    case "LIGHT": {
      updateMeshTexture(actor, grassTexture[1]);
      updateLight(actor, "add");
      if (actor.currentBehavior === "NORMAL") {
        const herbeLight = game.localCache.Sounds.get("herbeLight");
        if (herbeLight.getState() !== SoundPlayer.State.Playing) {
          herbeLight.play();
        }
      }
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
      updateLight(actor, "remove");
      break;
    }
    case "DEAD": {
      console.log("REMOVE OBJECT!");
      // scene.remove(actor.threeObject);
      break;
    }
  }
}

function updatePlayer(actor, currentBehavior) {
  switch (currentBehavior) {
    case "NORMAL": {
      if (game.data.hunt.walk()) {
        const chasedSound = game.localCache.Sounds.get("chased");
        if (chasedSound.getState() === SoundPlayer.State.Playing) {
          chasedSound.stop();
        }
      }
      // updateMeshTexture(actor, orbTexture[0]);

      break;
    }
    case "HUNTED": {
      if (!game.data.hunt.isStarted) {
        game.data.hunt.start();

        const chasedSound = game.localCache.Sounds.get("chased");
        if (chasedSound.getState() !== SoundPlayer.State.Playing) {
          chasedSound.play();
        }
      }

      // updateMeshTexture(actor, orbTexture[1]);
      break;
    }
    case "WOUNDED": {
      break;
    }
    case "DEAD": {
      const deathSound = game.localCache.Sounds.get("death");
      if (deathSound.getState() !== SoundPlayer.State.Playing) {
        deathSound.play();
      }

      var color = new THREE.Color("rgb(180, 180, 180)");
      if (actor.behaviors.length > 0) {
        actor.behaviors[0].canMove = false;
        actor.behaviors[0].light.color = color;
      }
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.5,
        metalness: 1,
        side: THREE.BackSide
      });
      material.needsUpdate = true;
      updateMeshTexture(actor, null, material);
      break;
    }
    case "RESPAWN": {
      let color = new THREE.Color(0xc4c2ad);
      if (actor.behaviors.length > 0) {
        actor.behaviors[0].canMove = true;
        actor.behaviors[0].light.color = color;
      }
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.5,
        metalness: 1,
        side: THREE.BackSide
      });
      material.needsUpdate = true;
      updateMeshTexture(actor, null, material);
      break;
    }
    case "OFFLINE": {
      actor.threeObject.children[1].intensity = 0;
      actor.threeObject.remove(actor.threeObject.children[0]);
      break;
    }
  }
}

async function start() {
  window.grpcClient = grpc.createClient(server);

  const backToLobbyBtn = document.getElementById("back-lobby");
  const restartBtn = document.getElementById("restart");

  let lobbyListener;
  if (!isHost) {
    backToLobbyBtn.classList.remove("hide");
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

  const fadeTxt = document.getElementById("fade-txt");
  if (!connectedOnce) {
    // Attempt to connect on the server
    const connectionPayload = await grpc.lobbyConnectionAttempt(grpcClient);

    if (!connectionPayload.ok) {
      fadeTxt.innerHTML = `❌ ${connectionPayload.reason}`;
      return;
    }

    ({ mapSize } = JSON.parse(connectionPayload.data));
    connectedOnce = true;
  }
  setupGuiButtons();
  restartBtn.classList.add("hide");
  closeWindowBtn.removeEventListener("click", closeListener);
  closeWindowBtn.classList.add("hide");
  if (!isHost) {
    backToLobbyBtn.classList.add("hide");
    backToLobbyBtn.removeEventListener("click", lobbyListener);
  }
  fadeTxt.innerHTML = `🚀 Loading and generating game assets`;

  const meta = new grpc.Metadata();
  meta.add("name", playerName);

  const gameDataStream = grpcClient.gameData(meta, { deadline: Infinity });
  gameDataStream.on("error", ({ type, data }) => {
    const payload = JSON.parse(data);
    if (type == "playerOffline") {
      const id = payload.id;
      const orbActor = game.localCache.Orbs.get(id);
      updatePlayer(orbActor, "OFFLINE");
    }
    reconnectAndResetGame();
  });
  gameDataStream.on("end", ({ type, data }) => {
    const payload = JSON.parse(data);
    if (type == "playerOffline") {
      const id = payload.id;
      const orbActor = game.localCache.Orbs.get(id);
      updatePlayer(orbActor, "OFFLINE");
    }
    reconnectAndResetGame();
  });
  initializeGameRenderer(gameDataStream, mapSize, playerName);
}

async function reconnectAndResetGame() {
  const fadeTxt = document.getElementById("fade-txt");
  fadeTxt.innerHTML = `🕐 Connection in progress to <b>${server}</b>`;
  const fade = document.getElementById("fade");
  fade.style.display = "flex";
  fade.classList.remove("hide");
  document.getElementById("close-window").classList.remove("hide");

  if (game instanceof GameRenderer) {
    if (typeof game.currentScene !== "undefined") {
      game.currentScene.clear();
    }

    game.renderer.clear();
    game.removeAllListeners("update");
    game.removeAllListeners("init");
    game = null;
    document.getElementById("game").innerHTML = "";
  }

  await start();
}

async function gameOver(gameDataStream) {
  const fadeTxt = document.getElementById("fade-txt");
  fadeTxt.innerHTML = `💀 The world is nothing now 💀`;
  const fade = document.getElementById("fade");
  fade.style.display = "flex";
  fade.classList.remove("hide");

  // setup restart button
  if (isHost) {
    const restartBtn = document.getElementById("restart");
    restartBtn.classList.remove("hide");
    document.getElementById("close-window").classList.remove("hide");
    if(!isRestartButtonSetup){
      let restartListener;
      restartListener = async () => {
        if (game instanceof GameRenderer) {
          if (typeof game.currentScene !== "undefined") {
            game.currentScene.clear();
          }
          game.renderer.clear();
          gameDataStream.removeAllListeners("data");
          gameDataStream.removeAllListeners("end");
          gameDataStream.removeAllListeners("error");
          game.removeAllListeners("update");
          game.removeAllListeners("init");
          game = null;
          document.getElementById("game").innerHTML = "";
        }
        await start();
        gameDataStream.write({ type: "restart", data: dummyData });
      };
      restartBtn.addEventListener("click", restartListener);
      isRestartButtonSetup = true;
    }
  }
}

async function win(gameDataStream) {
  const fadeTxt = document.getElementById("fade-txt");
  fadeTxt.innerHTML = `🌻 The world start to be something ! 🌻`;
  const fade = document.getElementById("fade");
  fade.style.display = "flex";
  fade.classList.remove("hide");
  // setup restart button
  if (isHost) {
    const restartBtn = document.getElementById("restart");
    restartBtn.classList.remove("hide");
    document.getElementById("close-window").classList.remove("hide");
    if(!isRestartButtonSetup){

    let restartListener;
    restartListener = async () => {
      if (game instanceof GameRenderer) {
        if (typeof game.currentScene !== "undefined") {
          game.currentScene.clear();
        }
        game.renderer.clear();
        gameDataStream.removeAllListeners("data");
        gameDataStream.removeAllListeners("end");
        gameDataStream.removeAllListeners("error");
        game.removeAllListeners("update");
        game.removeAllListeners("init");
        game = null;
        document.getElementById("game").innerHTML = "";
      }
      await start();
      gameDataStream.write({ type: "restart", data: dummyData });
    };
    restartBtn.addEventListener("click", restartListener);
    isRestartButtonSetup = true;
  }
  }
}

function createOrb(currentScene, orbs) {
  const orbsActor = new Actor(`orbs_${orbs.id}`);
  const orbsColor = new THREE.Color(0xffffff);
  orbsColor.setHex(Math.random() * 0xffffff);
  const orbsMesh = PlayerBehavior.CreateMesh(orbsColor);

  orbsActor.setGlobalPosition(PlayerBehavior.PosToVector3Ex(orbs.position));
  orbsActor.threeObject.add(orbsMesh);
  // orbsActor.threeObject.add(PlayerBehavior.CreateLight(4));
  orbsActor.addScriptedBehavior(new LightBehavior());
  orbsActor.getBehaviorByName("LightBehavior").awake();
  currentScene.add(orbsActor);

  return orbsActor;
}

function createShadow(currentScene, shadows) {
  const shadowsActor = new Actor(`shadows_${shadows.id}`);
  const shadowsColor = new THREE.Color("red");
  const shadowsMesh = PlayerBehavior.CreateMesh(shadowsColor);

  shadowsActor.setGlobalPosition(PlayerBehavior.PosToVector3Ex(shadows.position));
  shadowsActor.threeObject.add(shadowsMesh);
  shadowsActor.addScriptedBehavior(new LightBehavior(void 0, 100, 0.5, 10));
  currentScene.add(shadowsActor);

  return shadowsActor;
}

function createGrass(currentScene, grass) {
  const grassActor = new Actor(`grass_${grass.id}`);
  grassActor.addScriptedBehavior(new GrassBehavior(PlayerBehavior.PosToVector3Ex(grass.position)));
  currentScene.add(grassActor);

  return grassActor;
}

function setupGuiButtons() {
  if (isGuiButtonsSetup) {
    return;
  }
  isGuiButtonsSetup = true;
  let soundIsMuted = false;

  const muteSoundBtn = document.getElementById("mute-sound");
  const backToLobby = document.getElementById("back-lobby2");

  muteSoundBtn.addEventListener("click", () => {
    globalAudio.masterVolume = soundIsMuted ? 0.3 : 0;
    muteSoundBtn.innerHTML = soundIsMuted ? "🔉" : "🔈";
    soundIsMuted = !soundIsMuted;
  });

  backToLobby.addEventListener("click", () => {
    const currentWindow = remote.getCurrentWindow();
    if (isHost) {
      currentWindow.close();
    } else {
      currentWindow.loadURL(`file://${__dirname}/../views/lobby.html`);
    }
  });
}

async function initializeGameRenderer(gameDataStream, mapSize, playerName) {
  let isFirstGameData = true;

  // Setup GameRenderer
  const game = new GameRenderer(mapSize);
  window.game = game;
  game.modelLoader = new ModelLoader({ modelsPath, texturePath });
  game.gameDataStream;
  game.data = {
    hunt: new Timer(120, {
      autoStart: false,
      keepIterating: false
    })
  };
  GridBehavior.cubeSize = game.cubeSize;

  globalAudio.masterVolume = 0.3;
  const bgSound = await SoundPlayer.loadSoundAsset(globalAudio, "back-ambient-void.ogg", {
    loop: true,
    volume: 0.35
  });
  const chaseSound = await SoundPlayer.loadSoundAsset(globalAudio, "hon-won.wav", { volume: 0.6 });
  const herbeSound = await SoundPlayer.loadSoundAsset(globalAudio, "giling.ogg", { volume: 0.3 });
  const deathSound = await SoundPlayer.loadSoundAsset(globalAudio, "death.wav", { volume: 0.5 });

  game.localCache.Sounds.set("background", bgSound);
  game.localCache.Sounds.set("chased", chaseSound);
  game.localCache.Sounds.set("herbeLight", herbeSound);
  game.localCache.Sounds.set("death", deathSound);
  game.on("init", () => {
    bgSound.play();
  });
  setupGuiButtons();

  // Setup all Scenes default items
  const currentScene = new Scene();
  const Player = new Actor("Player");
  Player.addScriptedBehavior(new PlayerBehavior());
  currentScene.add(Player);

  const camera = new Camera(Player);
  camera.camera.lookAt(Player.threeObject.position);
  currentScene.add(camera.camera);
  Player.threeObject.add(camera.camera);
  for (const cube of GridBehavior.generateGridEx(mapSize.x, mapSize.z)) {
    currentScene.add(cube);
  }

  // Local GameRenderer Update
  game.on("update", () => {
    const playerPos = Player.threeObject.position.clone();

    // Send our position to the server
    const data = JSON.stringify({ x: playerPos.x / game.cubeSize, z: playerPos.z / game.cubeSize });
    gameDataStream.write({ type: "player-moved", data });

    camera.update(game, playerPos, Player);
  });

  // Load textures that we need
  const textures = await Promise.all(texturesAssets.map((name) => game.modelLoader.loadTexture(name)));
  const grassTexture = [textures[0], textures[1]];

  // Get charge bar & mask
  const chargeBar = document.getElementById("charge-bar");
  const chargeMask = document.getElementById("charge-mask");

  // Server state & events
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
          Player.setGlobalPosition(PlayerBehavior.PosToVector3Ex(orbs.position));
        } else {
          game.localCache.Orbs.set(orbs.id, createOrb(currentScene, orbs));
        }
      }
      for (const shadow of payload.shadows) {
        game.localCache.Shadows.set(shadow.id, createShadow(currentScene, shadow));
      }

      game.renderer.domElement.focus();
      game.init(currentScene, camera.camera);
      // game.input.lockMouse();
      setTimeout(() => {
        gameDataStream.write({
          type: "player-loaded",
          data: dummyData
        });

        const fade = document.getElementById("fade");
        fade.classList.add("hide");
        setTimeout(() => {
          fade.style.display = "none";
        }, 1000);
      }, 200);

      return;
    } else if (type === "currentState") {
      for (const orb of payload.orbs) {
        if (game.localCache.Orbs.has(orb.id)) {
          const orbActor = game.localCache.Orbs.get(orb.id);
          if (orbActor.currentBehavior !== orb.currentBehavior) {
            orbActor.currentBehavior = orb.currentBehavior;
            updatePlayer(orbActor, orb.currentBehavior);
          }

          if (orb.name === playerName) {
            const loadingGrass = orb.loadingGrass;
            if (loadingGrass === null) {
              if (!chargeBar.classList.contains("hide")) {
                chargeBar.classList.add("hide");
              }
              continue;
            }

            if (chargeBar.classList.contains("hide")) {
              chargeBar.classList.remove("hide");
            }
            const grassActor = game.localCache.Grass.get(orb.loadingGrass);
            const factor = 100 - grassActor.loading * 100;
            chargeMask.style.width = `${factor}%`;

            continue;
          }

          const newPosition = PlayerBehavior.PosToVector3Ex(orb.position);
          orbActor.setGlobalPosition(newPosition);
        } else {
          game.localCache.Orbs.set(orb.id, createOrb(currentScene, orb));
        }
      }

      for (const shadows of payload.shadows) {
        if (game.localCache.Shadows.has(shadows.id)) {
          const shadowActor = game.localCache.Shadows.get(shadows.id);
          const newPosition = PlayerBehavior.PosToVector3Ex(shadows.position);
          shadowActor.setGlobalPosition(newPosition);
        } else {
          game.localCache.Shadows.set(shadows.id, createShadow(currentScene, shadows));
        }
      }

      for (const grass of payload.grass) {
        if (game.localCache.Grass.has(grass.id)) {
          /** @type {Actor} */
          const grassActor = game.localCache.Grass.get(grass.id);
          grassActor.loading = grass.loading;

          if (grassActor.currentBehavior !== grass.currentBehavior) {
            updateGrass(grassActor, grass.currentBehavior, grassTexture, currentScene.scene);
            grassActor.currentBehavior = grass.currentBehavior;
          }
        } else {
          game.localCache.Grass.set(grass.id);
        }
      }
    } else if (type === "grass-dead") {
      /** @type {Actor} */
      const grassActor = game.localCache.Grass.get(payload.id);
      grassActor.threeObject.children[1].intensity = 0;
      grassActor.threeObject.remove(grassActor.threeObject.children[0]);

      // updateGrass(grassActor, "DEAD", grassTexture, currentScene.scene);
    } else if (type === "player-respawn") {
      /** @type {Actor} */
      const playerActor = game.localCache.Orbs.get(payload.id);
      updatePlayer(playerActor, "RESPAWN");
      gameDataStream.write({
        type: "player-hasRespawn",
        data: dummyData
      });
    } else if (type === "player-dead") {
      const playerActor = game.localCache.Orbs.get(payload.id);
      if (playerActor.name == "Player") {
        updatePlayer(playerActor, "DEAD");
      }
    } else if (type === "gameOver") {
      gameOver(gameDataStream);
    } else if (type === "win") {
      win(gameDataStream);
    }
  });
}

module.exports = {
  start
};
