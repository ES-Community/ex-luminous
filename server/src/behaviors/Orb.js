"use strict";

const { randomPosition } = require("../utils/random");

const Entity = require("./Entity");

const ORB_MAX_HP = 1;

class Orb extends Entity {
  static Behavior = {
    NORMAL: "NORMAL",
    HUNTED: "HUNTED",
    WOUNDED: "WOUNDED",
    DEAD: "DEAD",
    OFFLINE: "OFFLINE"
  };
  constructor(name) {
    super(randomPosition(), ORB_MAX_HP);
    this.name = name;
    this.huntedBy = [];
    this.interactingWith = null;
    this.currentBehavior = Orb.Behavior.NORMAL;
    this.isDead = false;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      currentBehavior: this.currentBehavior,
      isDead: this.isDead
    };
  }

  update(gameState) {
    if (this.currentBehavior === "OFFLINE") {
      return;
    }
    this.isHunted();
    switch (this.currentBehavior) {
      case Orb.Behavior.NORMAL: {
        if (this.isTouchingAnyShadow(gameState)) {
          this.currentBehavior = Orb.Behavior.WOUNDED;
        }
        break;
      }
      case Orb.Behavior.HUNTED: {
        break;
      }
      case Orb.Behavior.WOUNDED: {
        console.error("player is wounded")
        this.healthPoints--;
        if (this.healthPoints === 0) {
          this.currentBehavior = Orb.Behavior.DEAD;
          game.emit("change", "player-dead", { id: this.id });
          this.delete();
        }
        break;
      }
      case Orb.Behavior.DEAD: {
        console.error("player is dead") 
               break;
      }
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

  isTouchingAnyShadow(gameState) {
    return gameState.shadows.some((shadow) => this.isTouching(shadow));
  }
}

module.exports = Orb;
