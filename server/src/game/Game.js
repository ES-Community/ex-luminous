"use strict";

const { EventEmitter } = require("events");

const { TICKS_PER_SECOND } = require("../config");
const Orb = require("../behaviors/Orb");

const GameState = require("./GameState");

const waitBetweenTicks = Math.round(1000 / TICKS_PER_SECOND);

class Game extends EventEmitter {
  constructor() {
    super();

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
    };

    gameLoop();
  }

  update() {
    this.state.shadows.forEach((shadow) => shadow.update(this.state, this));
    this.state.shadows = this.state.shadows.filter(notDeleted);

    this.state.grass.forEach((grass) => grass.update(this.state, this));
    this.state.grass = this.state.grass.filter(notDeleted);

    this.state.orbs.forEach((orb) => orb.update(this.state, this));
    this.state.orbs = this.state.orbs.filter(notDeleted);

    this.state.gameTicks += 1;
    this.emit("change", "currentState", this.state);
  }

  addPlayer(name) {
    this.state.orbs.push(new Orb(name));
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
      default:
        throw new Error("Missing data handler");
    }
  }

  setPlayerOffline(player) {
    const orb = this.findOrbByPlayer(player);
    orb.previousBehavior = orb.currentBehavior;
    orb.currentBehavior = "OFFLINE";
    for (const shadow of orb.huntedBy) {
      shadow.currentMeal = null;
      shadow.setWandering();
    }
    orb.huntedBy = [];
    orb.interactingWith = null;
  }

  setPlayerOnline(player) {
    const orb = this.findOrbByPlayer(player);
    orb.currentBehavior = orb.previousBehavior;
    orb.previousBehavior = null;
  }

  findOrbByPlayer(player) {
    return this.state.orbs.find((orb) => orb.name === player.name);
  }

  getTicks() {
    return this.state.gameTicks;
  }

  pause() {
    clearTimeout(this.timeout);
    this.timeout = null;
    this.state.isPaused = true;
  }
}

function notDeleted(entity) {
  return !entity.deleted;
}

module.exports = Game;
