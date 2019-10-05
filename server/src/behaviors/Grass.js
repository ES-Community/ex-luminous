"use strict";

const Entity = require("./Entity");

const GRASS_MAX_HP = 3;

class Grass extends Entity {
  static State = {
    NORMAL: "NORMAL",
    LIGHT: "LIGHT"
  };

  constructor(position) {
    super(position, GRASS_MAX_HP);

    this.state = Grass.State.NORMAL;
    this.loading = 0;
    this.orbContact = 0;
  }

  update(gameState) {
    switch (this.state) {
      case Grass.State.NORMAL: {
        if (this.isTouchingAnyOrb(gameState)) {
          this.orbContact++;
          this.state = Grass.State.LIGHT;
        }
        break;
      }
      default: {
        throw new Error(`missing state implementation: ${this.state}`);
      }
    }
  }

  isTouchingAnyOrb(gameState) {
    return gameState.orbs.some((orb) => this.isTouching(orb));
  }
}

module.exports = Grass;
