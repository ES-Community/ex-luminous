"use strict";

const { EventEmitter } = require("events");

const { TICKS_PER_SECOND } = require("../config");
const Orb = require("../behaviors/Orb");

const generateGameState = require("./generateGameState");

class Game extends EventEmitter {
  constructor() {
    super();

    this.isInitialized = false;
    this.waitBetweenTicks = Math.round(1000 / TICKS_PER_SECOND);
    this.timeout;

    this.state = generateGameState();
  }

  start() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    const gameLoop = () => {
      this.timeout = setTimeout(gameLoop, this.waitBetweenTicks);
      this.update();
    };

    gameLoop();
  }

  update() {
    this.state.shadows.forEach((shadow) => shadow.update(this.state, this));
    this.state.shadows = this.state.shadows.filter(notDeleted);

    this.state.grass.forEach((grass) => grass.update(this.state, this));
    this.state.grass = this.state.grass.filter(notDeleted);

    this.state.gameTicks += 1;
    this.emit("change", "currentState", this.state);
  }

  addPlayer(name) {
    this.state.orbs.push(new Orb(name));
  }

  receiveData(player, type, data) {
    switch (type) {
      case "player-moved": {
        const orb = this.state.orbs.find((orb) => orb.name === player.name);
        if (typeof orb !== "undefined") {
          orb.position = data;
        }
        break;
      }
      default:
        throw new Error("Missing data handler");
    }
  }

  getTicks() {
    return this.state.gameTicks;
  }
}

function notDeleted(entity) {
  return !entity.deleted;
}

module.exports = Game;
