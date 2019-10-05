"use strict";

const { EventEmitter } = require("events");

const generateGameState = require("./generateGameState");

const TICKS_PER_SECOND = 1;

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
    console.log("update tick");
    this.state.shadows.forEach((shadow) => shadow.update(this.state))
    this.state.grass.forEach((grass) => grass.update(this.state));
    this.state.gameTicks += 1;
    console.log(this.state);
    this.emit("change", "currentState", this.state);
  }
}

module.exports = Game;
