"use strict";

const Entity = require("./Entity");
const Orb = require("./Orb");
const { TICKS_PER_SECOND, SHADOW_NORMAL_VISION_RADIUS, SHADOW_HUNTING_VISION_RADIUS } = require("../config");

const randomDirection = require("../utils/randomDirection");
const { timeToTicks } = require("../utils/convertTicks");

const SHADOW_MAX_HP = 3;
const SHADOW_SPEED = 8 / TICKS_PER_SECOND;
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
        if (this.remainingWanderingTicks === null && this.wanderingSteps === null) {
          this.prepareWandering();
        }
        // move
        this.wander();

        break;
      }
      case Shadow.Behavior.WAITING: {
        this.wait();
        break;
      }
      case Shadow.Behavior.EATING: {
        const grass = this.currentMeal;
        const distance = this.distanceTo(grass);
        if (distance <= SHADOW_SPEED) {
          this.moveTo(grass.position);
        } else {
          this.moveTowards(grass);
        }
        break;
      }
      case Shadow.Behavior.HUNTING: {
        const orb = this.currentMeal;
        const distance = this.distanceTo(orb);
        if (distance <= SHADOW_SPEED) {
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
    const orbList = this.sortByDistance(gameState.orbs);
    const orb = orbList.find(inVisionRadius);
    if (grass) {
      this.currentBehavior = Shadow.Behavior.EATING;
      this.currentMeal = grass.entity;
      return;
    } else if (grass == undefined) {
      if (orb) {
        this.currentBehavior = Shadow.Behavior.HUNTING;
        this.currentMeal = orb.entity;
        orb.entity.huntedBy.push(this);
        return;
      } else if (orb == undefined) {
        if(this.currentMeal instanceof Orb && this.currentMeal != null)
        {
          console.error(`Current meal before filter:`)
          console.error(this.currentMeal)
          let result = this.currentMeal.huntedBy.filter(shadow => shadow.id == this.id);
          this.currentMeal.huntedBy = result;
          console.error(`Current meal after filter:`)
          console.error(this.currentMeal)
        }
        this.currentMeal = null;
        this.currentBehavior = Shadow.Behavior.WANDERING;
        return;
      }
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
    this.moveTo({
      x: this.position.x + this.wanderingSteps.x,
      z: this.position.z + this.wanderingSteps.z
    });
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

  moveTowards(entity) {
    const direction = Math.atan2(entity.position.z - this.position.z, entity.position.x - this.position.x);
    this.moveTo({
      x: this.position.x + SHADOW_SPEED * Math.cos(direction),
      z: this.position.z + SHADOW_SPEED * Math.sin(direction)
    });
  }
}

module.exports = Shadow;
