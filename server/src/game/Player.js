"use strict";

class Player {
  constructor() {
    this.seen = new Date();
    this.gameDataStream = null;
  }

  ping() {
    this.seen = new Date();
  }

  setGameDataStream(stream) {
    this.gameDataStream = stream;
  }

  sendGameData(type, data) {
    if (this.gameDataStream) {
      this.gameDataStream.write({ type, data: JSON.stringify(data) });
    }
  }
}

module.exports = Player;
