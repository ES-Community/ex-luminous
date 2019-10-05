"use strict";

const getIp = require("../utils/getIp");

const Player = require("./Player");

class GameServer {
  constructor() {
    /** @type {Map<string, Player>} */
    this.players = new Map();
    setInterval(() => {
      console.log({ state: this });
      for (const player of this.players.values()) {
        player.sendGameData("interval", { hello: "world" });
      }
    }, 1000);
  }

  getPlayer(call) {
    return this.players.get(getIp(call));
  }

  connect(call, callback) {
    const clientIp = getIp(call);
    let player = this.players.get(clientIp);
    if (!player) {
      player = new Player();
      this.players.set(clientIp, player);
    }
    player.ping();
    callback(null, { ok: true });
  }

  gameData(stream) {
    const player = this.getPlayer(stream);
    player.setGameDataStream(stream);
    player.sendGameData("init", "test");
  }
}

module.exports = GameServer;
