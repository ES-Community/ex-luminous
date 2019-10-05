"use strict";

const Entity = require("./Entity");

const SHADOW_MAX_HP = 3;
const SHADOW_SPEED = 1;

class Shadow extends Entity {

  static Behavior = {
    WANDERING: "WANDERING",
    HUNTING: "HUNTING",
    EATING: "EATING"
  };

  constructor(position) {
    super(position, SHADOW_MAX_HP);

    this.currentBehavior = Shadow.Behavior.WANDERING;
  }

  update (gameState) {
    console.log('updated called')
  }
}

module.exports = Shadow;
