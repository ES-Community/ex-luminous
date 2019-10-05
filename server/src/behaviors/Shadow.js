"use strict";

const Entity = require("./Entity");

const randomDirection = require("../utils/randomDirection");
const { timeToTicks } = require("../utils/convertTicks");

const SHADOW_MAX_HP = 3;
const SHADOW_SPEED = timeToTicks(1); // scene unit per second
const SHADOW_AMPLITUDE = 5;

class Shadow extends Entity {

  static Behavior = {
    WAITING: "WAITING",
    WANDERING: "WANDERING",
    HUNTING: "HUNTING",
    EATING: "EATING"
  };

  constructor(position) {
    super(position, SHADOW_MAX_HP);

    this.currentBehavior = Shadow.Behavior.WAITING;
    this.wanderingSteps = null;
    this.remainingWanderingTicks = null;
  }

  update (gameState) {
    switch (this.currentBehavior) {
      case Shadow.Behavior.WAITING: {
        const selectedDirection = randomDirection();
        const deltaX = Math.cos(selectedDirection) * SHADOW_AMPLITUDE;
        const deltaZ = Math.sin(selectedDirection) * SHADOW_AMPLITUDE;
        this.wanderingSteps = {
          x: deltaX * SHADOW_SPEED,
          z: deltaZ * SHADOW_SPEED
        }
        this.remainingWanderingTicks = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaZ, 2)) / SHADOW_SPEED;
        this.currentBehavior = Shadow.Behavior.WANDERING;
        break;
      }
      case Shadow.Behavior.WANDERING: {
        // move
        this.position.x += this.wanderingSteps.x;
        this.position.z += this.wanderingSteps.z;
        this.remainingWanderingTicks--;
        if(this.remainingWanderingTicks <= 0) {
          this.remainingWanderingTicks = null;
          this.wanderingSteps = null;
          this.currentBehavior = Shadow.Behavior.WAITING;
        }

        // look for orbs
        break;
      }
      default: {
        throw new Error(`missing state implementation: ${this.state}`);
      }
    }
  }
}

module.exports = Shadow;
