"use strict";

class Player {
  constructor(ip, name) {
    this.ip = ip;
    this.name = name;
    this.gameDataStream = null;
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
