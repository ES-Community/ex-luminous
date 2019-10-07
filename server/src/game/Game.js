"use strict";

const { EventEmitter } = require("events");

const { TICKS_PER_SECOND } = require("../config");
const Orb = require("../behaviors/Orb");
const Grass = require("../behaviors/Grass");

const GameState = require("./GameState");

const waitBetweenTicks = Math.round(1000 / TICKS_PER_SECOND);

class Game extends EventEmitter {
  constructor(server) {
    super();

    this.server = server;
    this.timeout = null;
    this.state = new GameState();
  }

  start() {
    if (this.timeout !== null) {
      return;
    }

    this.state.isPaused = false;

    const gameLoop = () => {
      this.timeout = setTimeout(gameLoop, waitBetweenTicks);
      this.update();
      this.checkGameOver();
      this.checkWin();
    };

    gameLoop();
  }

  pause() {
    clearTimeout(this.timeout);
    this.timeout = null;
    this.state.isPaused = true;
    this.emitChange();
  }

  restart() {
    if (this.state.gameStep !== 0) {
      throw new Error("can only restart if game is over (gameStep = 0)");
    }
    this.state = new GameState();
    for (const player of this.server.onlinePlayers.keys()) {
      this.addPlayer(player);
    }
    for (const player of this.server.offlinePlayers.keys()) {
      const orb = this.addPlayer(player);
      orb.currentBehavior = Orb.Behavior.OFFLINE;
    }
    this.start();
  }

  update() {
    this.state.shadows.forEach((shadow) => shadow.update(this.state, this));
    this.state.shadows = this.state.shadows.filter(notDeleted);

    this.state.grass.forEach((grass) => grass.update(this.state, this));
    this.state.grass = this.state.grass.filter(notDeleted);

    this.state.orbs.forEach((orb) => orb.update(this.state, this));
    this.state.orbs = this.state.orbs.filter(notDeleted);

    this.state.gameTicks += 1;
    this.emitChange();
  }

  checkGameOver() {
    if (this.state.orbs.length > 0) {
      const isAllDead = this.state.orbs.every((orb) => orb.currentBehavior == Orb.Behavior.DEAD);
      if (isAllDead) {
        this.pause();
        this.state.gameStep = 0;
        this.emit("change", "gameOver", this.state)
      }
    }
  }

  checkWin() {
    if (this.state.grass.length > 0) {
      const oneIsBlooming = this.state.grass.some((grass) => grass.currentBehavior == Grass.Behavior.BLOOM);
      if (oneIsBlooming) {
        this.pause();
        this.state.gameStep = 0;
        this.emit("change", "win", this.state)
      }
    }
  }


  emitChange() {
    this.emit("change", "currentState", this.state);
  }

  addPlayer(name) {
    const orb = new Orb(name);
    this.state.orbs.push(orb);
    return orb;
  }

  receiveData(player, type, data) {
    switch (type) {
      case "player-moved": {
        const orb = this.findOrbByPlayer(player);
        if (typeof orb !== "undefined") {
          orb.position = data;
        }
        break;
      }
      case "player-hasRespawn": {
        const orb = this.findOrbByPlayer(player);
        orb.currentBehavior = Orb.Behavior.NORMAL;
        break;
      }
      case "player-loaded": {
        const orb = this.findOrbByPlayer(player);
        player.goingOnline = setTimeout(() => {
          orb.currentBehavior = orb.previousBehavior || Orb.Behavior.NORMAL;
        }, 1000);
        break;
      }
      case "restart": {
        this.restart();
        break;
      }
      default:
        throw new Error(`Missing data handler: ${type}`);
    }
  }

  setPlayerOffline(player) {
    clearTimeout(player.goingOnline);
    const orb = this.findOrbByPlayer(player);
    orb.previousBehavior = orb.currentBehavior;
    orb.currentBehavior = Orb.Behavior.OFFLINE;
    for (const shadow of orb.huntedBy) {
      shadow.currentMeal = null;
      shadow.setWandering();
    }
    orb.huntedBy = [];
    orb.interactingWith = null;
    orb.loadingGrass = null;
  }

  setPlayerOnline(player) {
    const orb = this.findOrbByPlayer(player);
    orb.currentBehavior = Orb.Behavior.ONLINE;
  }

  findOrbByPlayer(player) {
    return this.state.orbs.find((orb) => orb.name === player.name);
  }

  getTicks() {
    return this.state.gameTicks;
  }
}

function notDeleted(entity) {
  return !entity.deleted;
}

module.exports = Game;
