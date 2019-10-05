"use strict";

const getIp = require("../utils/getIp");

const Game = require("./Game");
const Player = require("./Player");

class GameServer {
  constructor() {
    /** @type {Map<string, Player>} */
    this.playersByIp = new Map();

    /** @type {Map<string, Player>} */
    this.playersByName = new Map();

    this.game = new Game();

    this.game.on("change", (type, data) => {
      for (const player of this.players()) {
        player.sendGameData(type, data);
      }
    });

    this.game.start();
  }

  players() {
    return this.playersByIp.values();
  }

  getPlayer(call) {
    return this.playersByIp.get(getIp(call));
  }

  Connect(call, callback) {
    const clientIp = getIp(call);
    const name = call.request.name;
    let player = this.playersByIp.get(clientIp);

    if (!player) {
      if (this.playersByName.has(name)) {
        return callback(null, { ok: false, reason: `name ${name} is already in use` });
      }
      player = new Player(clientIp, name);
      this.playersByIp.set(clientIp, player);
      this.playersByName.set(name, player);
      this.game.addPlayer(name);
    } else {
      if (name !== player.name) {
        if (this.playersByName.has(name)) {
          return callback(null, { ok: false, reason: `name ${name} is already in use` });
        }
        this.playersByName.delete(player.name);
        player.setName(name);
        this.playersByName.set(name, player);
      }
    }
    player.ping();
    callback(null, { ok: true });
  }

  GameData(stream) {
    const player = this.getPlayer(stream);
    player.setGameDataStream(stream);
  }
}

module.exports = GameServer;
