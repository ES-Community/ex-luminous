"use strict";

const randomCoordinates = require("../utils/randomCoordinates");

const Entity = require("./Entity");

const ORB_MAX_HP = 1;

class Orb extends Entity {
  static Behavior = {
    NORMAL: "NORMAL",
    HUNTED: "HUNTED",
    DEAD: "DEAD"
  };
  constructor(name) {
    super(randomCoordinates(), ORB_MAX_HP);
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
      isDead: this.isDead,
    };
  }

  update(gameState) {
    this.isHunted();
    switch (this.currentBehavior) {
      case Orb.Behavior.NORMAL: {
        break;
      }
      case Orb.Behavior.HUNTED: {
        break;
      }
      case Orb.Behavior.DEAD: {
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
}

module.exports = Orb;
