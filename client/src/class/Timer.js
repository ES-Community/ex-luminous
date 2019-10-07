"use strict";

class Timer {
  /**
   * @constructor
   * @param {number} [tickInterval=60]
   * @param {object} [options]
   * @param {boolean} [options.autoStart]
   * @param {boolean} [options.keepIterating]
   */
  constructor(tickInterval = 60, options = {}) {
    const { autoStart = Timer.AutoStart, keepIterating = Timer.KeepIterating, callback = null } = options;

    this.tickInterval = tickInterval;
    this.isStarted = autoStart;
    this.keepIterating = keepIterating;
    this.callback = callback;
    this.tick = 0;
  }

  start() {
    this.isStarted = true;
  }

  walk() {
    if (!this.isStarted) {
      return false;
    }

    if (this.tick < this.tickInterval) {
      this.tick++;
      return false;
    }

    if (!this.keepIterating) {
      this.isStarted = false;
    }

    this.tick = 0;
    if (this.callback !== null) {
      this.callback();
    }
    return true;
  }
}

Timer.AutoStart = true;
Timer.KeepIterating = true;

module.exports = Timer;
