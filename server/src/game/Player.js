"use strict";

class Player {
  constructor(ip, name) {
    this.ip = ip;
    this.name = name;
    this.seen = new Date();
    this.gameDataStream = null;
  }

  ping() {
    this.seen = new Date();
  }

  setGameDataStream(stream) {
    this.gameDataStream = stream;
  }

  setName(name) {
    this.name = name;
  }

  sendGameData(type, data) {
    if (this.gameDataStream) {
      this.gameDataStream.write({ type, data: JSON.stringify(data) });
    }
  }
}

module.exports = Player;
