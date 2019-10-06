"use strict";

const { TICKS_PER_SECOND } = require("../config");
const getIp = require("../utils/getIp");

const Game = require("./Game");
const Player = require("./Player");

class GameServer {
  constructor() {
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
    return this.playersByName.values();
  }

  getPlayer(call) {
    return this.playersByName.get(call.metadata.get("name")[0]);
  }

  enableReport() {
    let tickList = [];
    setInterval(() => {
      const ticks = this.game.getTicks();
      tickList.push({ ticks, time: Date.now() / 1000 });
      let tps = TICKS_PER_SECOND;
      if (tickList.length > 10) {
        tickList.shift();
      }
      if (tickList.length > 1) {
        const lastTick = tickList[tickList.length - 1];
        const firstTick = tickList[0];
        tps = (lastTick.ticks - firstTick.ticks) / (lastTick.time - firstTick.time);
      }

      process.send({
        ticks,
        tps: Math.round(tps * 100) / 100,
        time: ticks / TICKS_PER_SECOND,
        players: Array.from(this.players()).map((player) => ({ name: player.name, ip: player.ip }))
      });
    }, 1000);
  }

  Connect(call, callback) {
    const clientIp = getIp(call);
    const name = call.request.name;
    let player = this.playersByName.get(name);

    if (!player) {
      player = new Player(clientIp, name);
      this.playersByName.set(name, player);
      this.game.addPlayer(name);
    }
    player.ping();

    const { mapSize } = this.game.state;
    callback(null, { ok: true, data: JSON.stringify({ mapSize }) });
  }

  GameData(stream) {
    const player = this.getPlayer(stream);
    player.setGameDataStream(stream);
    stream.on("data", (data) => {
      this.game.receiveData(player, data.type, JSON.parse(data.data));
    });
  }
}

module.exports = GameServer;
