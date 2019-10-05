"use strict";

const getIp = require("../utils/getIp");

const Player = require("./Player");

class GameServer {
  constructor() {
    /** @type {Map<string, Player>} */
    this.playersByIp = new Map();

    /** @type {Map<string, Player>} */
    this.playersByName = new Map();

    setInterval(() => {
      console.log({
        players: Array.from(this.playersByIp.values())
      });
      for (const player of this.playersByIp.values()) {
        player.sendGameData("interval", { hello: "world" });
      }
    }, 1000);
  }

  getPlayer(call) {
    return this.playersByIp.get(getIp(call));
  }

  Connect(call, callback) {
    const clientIp = getIp(call);
    const name = call.request.name;
    let player = this.playersByIp.get(clientIp);
    if (!player) {
      player = new Player(clientIp, name);
      this.playersByIp.set(clientIp, player);
      this.playersByName.set(name, player);
    }
    player.ping();
    callback(null, { ok: true });
  }

  GameData(stream) {
    const player = this.getPlayer(stream);
    player.setGameDataStream(stream);
    player.sendGameData("init", "test");
  }
}

module.exports = GameServer;
