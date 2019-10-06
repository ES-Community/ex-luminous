"use strict";

const Entity = require("./Entity");
const { TICKS_PER_SECOND, SHADOW_NORMAL_VISION_RADIUS, SHADOW_HUNTING_VISION_RADIUS } = require("../config");

const randomDirection = require("../utils/randomDirection");
const { timeToTicks } = require("../utils/convertTicks");

const SHADOW_MAX_HP = 3;
const SHADOW_SPEED = 1.5 / TICKS_PER_SECOND;
const SHADOW_MAX_AMPLITUDE = 5;
const SHADOW_MAX_WAITING_TIME = 5;
const SHADOW_MIN_WAITING_TIME = 2;

class Shadow extends Entity {
  static Behavior = {
    WAITING: "WAITING",
    WANDERING: "WANDERING",
    HUNTING: "HUNTING",
    EATING: "EATING"
  };

  constructor(position) {
    super(position, SHADOW_MAX_HP);

    this.currentBehavior = Shadow.Behavior.WANDERING;
    this.wanderingSteps = null;
    this.remainingWanderingTicks = null;
    this.remainingWaitingTicks = null;
    this.currentMeal = null;
    this.currentHunt = null;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      currentBehavior: this.currentBehavior
    };
  }

  update(gameState) {
    switch (this.currentBehavior) {
      case Shadow.Behavior.WANDERING: {
        if (this.remainingWanderingTicks === null && this.wanderingSteps === null) {
          this.prepareWandering();
        }
        // move
        this.wander();

        this.lookForTarget(gameState);
        break;
      }
      case Shadow.Behavior.WAITING: {
        this.wait();

        this.lookForTarget(gameState);
        break;
      }
      case Shadow.Behavior.EATING: {
        const grass = this.currentMeal;
        const distance = this.distanceTo(grass);
        const direction = Math.atan2(grass.position.z - this.position.z, grass.position.x - this.position.x);
        if (distance <= SHADOW_SPEED) {
          this.position.x = grass.position.x;
          this.position.z = grass.position.z;
        } else {
          this.position.x += SHADOW_SPEED * Math.cos(direction);
          this.position.z += SHADOW_SPEED * Math.sin(direction);
        }
        break;
      }
      case Shadow.Behavior.HUNTING: {
        // todo
        break;
      }
      default: {
        throw new Error(`missing state implementation: ${this.state}`);
      }
    }
  }

  lookForTarget(gameState) {
    const visionRadius =
      this.currentBehavior === Shadow.Behavior.HUNTING ? SHADOW_NORMAL_VISION_RADIUS : SHADOW_HUNTING_VISION_RADIUS;
    function inVisionRadius(item) {
      return item.distance <= visionRadius;
    }
    const grassList = this.sortByDistance(gameState.grass.filter((grass) => grass.isLuminous()));
    const grass = grassList.find(inVisionRadius);
    if (grass) {
      this.currentBehavior = Shadow.Behavior.EATING;
      this.currentMeal = grass.entity;
      return;
    }
    const orbList = this.sortByDistance(gameState.orbs);
    const orb = orbList.find(inVisionRadius);
    if (orb) {
      this.currentBehavior = Shadow.Behavior.HUNTING;
      this.currentHunt = orb.entity;
      orb.entity.huntedBy.push(this);
      return;
    }
  }

  prepareWandering() {
    const selectedDirection = randomDirection();
    const moveAmplitude = Math.random() * (SHADOW_MAX_AMPLITUDE - 1) + 1;

    const deltaX = Math.cos(selectedDirection) * moveAmplitude;
    const deltaZ = Math.sin(selectedDirection) * moveAmplitude;

    this.remainingWanderingTicks = Math.hypot(deltaX, deltaZ) / SHADOW_SPEED;
    this.wanderingSteps = {
      x: deltaX / this.remainingWanderingTicks,
      z: deltaZ / this.remainingWanderingTicks
    };
  }

  wander() {
    this.position.x += this.wanderingSteps.x;
    this.position.z += this.wanderingSteps.z;
    this.remainingWanderingTicks--;
    if (this.remainingWanderingTicks <= 0) {
      // reset wandering
      this.remainingWanderingTicks = null;
      this.wanderingSteps = null;

      // wait
      this.remainingWaitingTicks = timeToTicks(
        Math.random() * (SHADOW_MAX_WAITING_TIME - SHADOW_MIN_WAITING_TIME) + SHADOW_MIN_WAITING_TIME
      );
      this.currentBehavior = Shadow.Behavior.WAITING;
    }
  }

  wait() {
    this.remainingWaitingTicks--;
    if (this.remainingWaitingTicks <= 0) {
      this.remainingWaitingTicks = null;
      this.currentBehavior = Shadow.Behavior.WANDERING;
    }
  }
}

module.exports = Shadow;
