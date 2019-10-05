"use strict";

const { EventEmitter } = require("events");

const TICKS_PER_SECOND = 1;

class Game extends EventEmitter {
  constructor() {
    super();

    this.isInitialized = false;
    this.waitBetweenTicks = Math.round(1000 / TICKS_PER_SECOND);
    this.timeout;
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
    console.log("update");
    this.emit("change", "test", { hello: "world" });
  }
}

module.exports = Game;
