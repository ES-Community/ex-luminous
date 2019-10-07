"use strict";

const {
  TICKS_PER_SECOND,
  SHADOW_NORMAL_VISION_RADIUS,
  SHADOW_HUNTING_VISION_RADIUS,
  SHADOW_MAX_HP,
  SHADOW_MIN_WANDERING_TIME,
  SHADOW_MAX_WANDERING_TIME,
  SHADOW_MAX_WAITING_TIME,
  SHADOW_MIN_WAITING_TIME,
  SHADOW_SPEED,
  SHADOW_RADIUS
} = require("../config");
const { randomFloatInRange, randomAngle } = require("../utils/random");
const { timeToTicks } = require("../utils/convertTicks");

const Entity = require("./Entity");
const Orb = require("./Orb");

const effectiveShadowSpeed = SHADOW_SPEED / TICKS_PER_SECOND;

class Shadow extends Entity {
  static RADIUS = SHADOW_RADIUS;

  static Behavior = {
    WAITING: "WAITING",
    WANDERING: "WANDERING",
    HUNTING: "HUNTING",
    EATING: "EATING"
  };

  constructor(position) {
    super(position, SHADOW_MAX_HP);

    this.currentMeal = null;
    this.setWandering();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      currentBehavior: this.currentBehavior
    };
  }

  update(gameState) {
    this.lookForTarget(gameState);
    switch (this.currentBehavior) {
      case Shadow.Behavior.WANDERING: {
        this.wander();
        break;
      }
      case Shadow.Behavior.WAITING: {
        this.lookForTarget(gameState);
        this.wait();
        break;
      }
      case Shadow.Behavior.EATING: {
        const grass = this.currentMeal;
        const distance = this.distanceTo(grass);
        if (distance <= effectiveShadowSpeed) {
          this.moveTo(grass.position);
        } else {
          this.moveTowards(grass);
        }
        break;
      }
      case Shadow.Behavior.HUNTING: {
        const orb = this.currentMeal;
        const distance = this.distanceTo(orb);
        if (distance <= effectiveShadowSpeed) {
          this.moveTo(orb.position);
        } else {
          this.moveTowards(orb);
        }
        break;
      }
      default: {
        throw new Error(`missing behavior implementation: ${this.currentBehavior}`);
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
      this.currentMeal = grass.entity;
      this.currentBehavior = Shadow.Behavior.EATING;
      return;
    }

    const orbList = this.sortByDistance(gameState.liveOrbs());
    const orb = orbList.find(inVisionRadius);

    if (orb) {
      this.currentMeal = orb.entity;
      this.currentBehavior = Shadow.Behavior.HUNTING;
      orb.entity.huntedBy.push(this);
      return;
    }

    if (this.currentMeal instanceof Orb) {
      this.currentMeal.huntedBy = this.currentMeal.huntedBy.filter((shadow) => this.id == shadow.id);
    }

    if (this.currentMeal) {
      if (this.currentMeal instanceof Orb) {
        this.currentMeal.huntedBy = [];
      }
      this.currentMeal = null;
      this.setWandering();
      return;
    }
  }

  wander() {
    this.moveInDirection(this.wanderingDirection);
    this.remainingWanderingTicks--;
    if (this.remainingWanderingTicks <= 0) {
      this.setWaiting();
    }
  }

  wait() {
    this.remainingWaitingTicks--;
    if (this.remainingWaitingTicks <= 0) {
      this.setWandering();
    }
  }

  moveTowards(entity) {
    this.moveInDirection(Math.atan2(entity.position.z - this.position.z, entity.position.x - this.position.x));
  }

  moveInDirection(direction) {
    this.moveTo({
      x: this.position.x + effectiveShadowSpeed * Math.cos(direction),
      z: this.position.z + effectiveShadowSpeed * Math.sin(direction)
    });
  }

  setWandering() {
    this.remainingWaitingTicks = null;

    this.currentBehavior = Shadow.Behavior.WANDERING;

    this.wanderingDirection = randomAngle();
    this.remainingWanderingTicks = Math.round(
      timeToTicks(randomFloatInRange(SHADOW_MIN_WANDERING_TIME, SHADOW_MAX_WANDERING_TIME))
    );
  }

  setWaiting() {
    this.wanderingDirection = null;
    this.remainingWanderingTicks = null;

    this.currentBehavior = Shadow.Behavior.WAITING;

    this.remainingWaitingTicks = Math.round(
      timeToTicks(randomFloatInRange(SHADOW_MIN_WAITING_TIME, SHADOW_MAX_WAITING_TIME))
    );
  }
}

module.exports = Shadow;
