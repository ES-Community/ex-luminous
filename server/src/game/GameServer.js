"use strict";

const { TICKS_PER_SECOND } = require("../config");
const getIp = require("../utils/getIp");

const Game = require("./Game");
const Player = require("./Player");

class GameServer {
  constructor() {
    /** @type {Map<string, Player>} */
    this.onlinePlayers = new Map();

    /** @type {Map<string, Player>} */
    this.offlinePlayers = new Map();

    this.game = new Game(this);

    this.game.on("change", (type, data) => {
      for (const player of this.players()) {
        player.sendGameData(type, data);
      }
    });

    this.game.start();
  }

  players() {
    return this.onlinePlayers.values();
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

  setPlayerOnline(clientIp, name) {
    if (this.offlinePlayers.has(name)) {
      const player = this.offlinePlayers.get(name);
      this.offlinePlayers.delete(name);
      this.onlinePlayers.set(name, player);
      this.game.setPlayerOnline(player);
    } else {
      const player = new Player(clientIp, name);
      this.onlinePlayers.set(name, player);
      this.game.addPlayer(name);
    }
    if (this.onlinePlayers.size === 1) {
      this.game.start();
    }
  }

  setPlayerOffline(player) {
    this.onlinePlayers.delete(player.name);
    this.offlinePlayers.set(player.name, player);
    this.game.setPlayerOffline(player);
    player.setGameDataStream(null);
    if (this.onlinePlayers.size === 0) {
      this.game.pause();
    }
  }

  Status(call, callback) {
    const name = call.request.name;
    const response = {
      players: this.onlinePlayers.size
    };
    if (this.onlinePlayers.has(name)) {
      response.canPlay = false;
      response.reason = `Username "${name}" is already in game`;
    } else {
      response.canPlay = true;
    }

    callback(null, response);
  }

  Connect(call, callback) {
    const clientIp = getIp(call);
    const name = call.request.name;

    if (this.onlinePlayers.has(name)) {
      return callback(null, { ok: false, reason: `Username "${name}" is already in game` });
    }

    console.log(`Player ${name} connected`);
    this.setPlayerOnline(clientIp, name);

    const { mapSize } = this.game.state;
    callback(null, { ok: true, data: JSON.stringify({ mapSize }) });
  }

  GameData(stream) {
    const name = stream.metadata.get("name")[0];
    const player = this.onlinePlayers.get(name);
    if (!player) {
      console.error(`Player tried to initiate data stream without connecting: ${name}`);
      stream.end();
      return;
    }
    player.setGameDataStream(stream);
    stream.on("data", (data) => {
      this.game.receiveData(player, data.type, JSON.parse(data.data));
    });
    stream.on("end", () => {
      console.log(`Player ${name} disconnected`);
      const clientPlayerData = this.game.findOrbByPlayer(player);
      this.makeClientPlayerOffline(clientPlayerData, stream);
      this.setPlayerOffline(player);
    });
    stream.on("error", (err) => {
      console.error("Server GameData stream error", name, err);
      const clientPlayerData = this.game.findOrbByPlayer(player);
      this.makeClientPlayerOffline(clientPlayerData, stream);
      this.setPlayerOffline(player);
    });
  }

  makeClientPlayerOffline(player, stream) {
    stream.emit("change", "playerOffline", player);
  }
}

module.exports = GameServer;
