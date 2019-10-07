"use strict";

const { randomPosition } = require("../utils/random");

const { ORB_LOAD_DELAY, ORB_RESPAWN_TIME, ORB_RADIUS, ORB_MAX_HP } = require("../config");
const { timeToTicks } = require("../utils/convertTicks");

const Entity = require("./Entity");

const playerLoadRespawnDelayTicks = Math.round(timeToTicks(ORB_LOAD_DELAY));
const playerRespawnTimeTicks = Math.round(timeToTicks(ORB_RESPAWN_TIME));

class Orb extends Entity {
  static RADIUS = ORB_RADIUS;

  static Behavior = {
    NORMAL: "NORMAL",
    HUNTED: "HUNTED",
    WOUNDED: "WOUNDED",
    DEAD: "DEAD",
    UNLOADRESPAWN: "UNLOADRESPAWN",
    LOADRESPAWN: "LOADRESPAWN",
    RESPAWN: "RESPAWN",
    OFFLINE: "OFFLINE",
    ONLINE: "ONLINE"
  };

  static LiveBehaviors = ["NORMAL", "HUNTED", "WOUNDED"];

  constructor(name) {
    super(randomPosition(), ORB_MAX_HP);
    this.name = name;
    this.huntedBy = [];
    this.interactingWith = null;
    this.currentBehavior = Orb.Behavior.ONLINE;
    this.previousBehavior = null;
    this.respawnTicks = 0;
    this.orbContact = 0;
    this.loadingGrass = null;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      currentBehavior: this.currentBehavior,
      loadingGrass: this.loadingGrass ? this.loadingGrass.id : null
    };
  }

  update(gameState, game) {
    switch (this.currentBehavior) {
      case Orb.Behavior.NORMAL: {
        this.isHunted();
        if (this.isTouchingAnyShadow(gameState)) {
          this.currentBehavior = Orb.Behavior.WOUNDED;
        }
        break;
      }
      case Orb.Behavior.HUNTED: {
        if (this.isTouchingAnyShadow(gameState)) {
          this.currentBehavior = Orb.Behavior.WOUNDED;
        }
        break;
      }
      case Orb.Behavior.WOUNDED: {
        if (--this.healthPoints === 0) {
          this.currentBehavior = Orb.Behavior.DEAD;
          game.emit("change", "player-dead", { id: this.id });
        }
        break;
      }
      case Orb.Behavior.UNLOADRESPAWN: {
        if (--this.respawnTicks === 0) {
          this.currentBehavior = Orb.Behavior.DEAD;
        }
        break;
      }
      case Orb.Behavior.LOADRESPAWN: {
        if (!this.isTouchingAnyOrb(gameState)) {
          this.currentBehavior = Orb.Behavior.UNLOADRESPAWN;
        } else if (++this.respawnTicks === playerRespawnTimeTicks) {
          this.currentBehavior = Orb.Behavior.RESPAWN;
        }
        break;
      }
      case Orb.Behavior.RESPAWN: {
        game.emit("change", "player-respawn", { id: this.id });
        break;
      }
      case Orb.Behavior.DEAD: {
        if (this.isTouchingAnyOrb(gameState)) {
          if (++this.orbContact === playerLoadRespawnDelayTicks) {
            this.orbContact = 0;
            this.currentBehavior = Orb.Behavior.LOADRESPAWN;
          }
        }
        break;
      }
      case Orb.Behavior.ONLINE:
      case Orb.Behavior.OFFLINE:
        break;
      default: {
        throw new Error(`missing behavior implementation: ${this.currentBehavior}`);
      }
    }
  }
  isHunted() {
    if (this.huntedBy.length > 0) {
      this.currentBehavior = Orb.Behavior.HUNTED;
    } else {
      this.currentBehavior = Orb.Behavior.NORMAL;
    }
  }
}

module.exports = Orb;
