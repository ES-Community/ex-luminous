"use strict";

const { GRASS_LIGHT_TIMEOUT, GRASS_LOAD_DELAY, GRASS_MAX_HP, GRASS_BLOOM_TIME } = require("../config");
const { timeToTicks } = require("../utils/convertTicks");

const Entity = require("./Entity");

const grassLightTimeoutTicks = Math.round(timeToTicks(GRASS_LIGHT_TIMEOUT));
const grassLoadDelayTicks = Math.round(timeToTicks(GRASS_LOAD_DELAY));
const grassBloomTimeTicks = Math.round(timeToTicks(GRASS_BLOOM_TIME));

class Grass extends Entity {
  static Behavior = {
    NORMAL: "NORMAL",
    LIGHT: "LIGHT",
    LOADING: "LOADING",
    UNLOADING: "UNLOADING",
    BLOOM: "BLOOM",
    WOUNDED: "WOUNDED"
  };

  constructor(position) {
    super(position, GRASS_MAX_HP);

    this.currentBehavior = Grass.Behavior.NORMAL;
    this.bloomTicks = 0;
    this.loading = 0;
    this.orbContactTicks = 0;
    this.orb = null;
    this.lightTicks = 0;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      currentBehavior: this.currentBehavior,
      loading: this.loading
    };
  }

  update(gameState, game) {
    this.checkOrbs(gameState);
    switch (this.currentBehavior) {
      case Grass.Behavior.NORMAL: {
        if (this.orb) {
          this.currentBehavior = Grass.Behavior.LIGHT;
          this.lightTicks = grassLightTimeoutTicks;
        }
        break;
      }
      case Grass.Behavior.LIGHT: {
        if (!this.orb && --this.lightTicks === 0) {
          this.orbContactTicks = 0;
          this.currentBehavior = Grass.Behavior.NORMAL;
        } else if (this.isTouchingAnyShadow(gameState)) {
          this.currentBehavior = Grass.Behavior.WOUNDED;
        } else if (this.orb) {
          this.lightTicks = grassLightTimeoutTicks;
          if (++this.orbContactTicks === grassLoadDelayTicks) {
            this.orbContactTicks = 0;
            this.currentBehavior = Grass.Behavior.LOADING;
          }
        }
        break;
      }
      case Grass.Behavior.LOADING: {
        if (!this.orb) {
          this.currentBehavior = Grass.Behavior.UNLOADING;
          break;
        }

        this.bloomTicks++;
        this.loading = this.bloomTicks / grassBloomTimeTicks;
        if (this.bloomTicks === grassBloomTimeTicks) {
          this.currentBehavior = Grass.Behavior.BLOOM;
          break;
        }

        if (this.isTouchingAnyShadow(gameState)) {
          this.currentBehavior = Grass.Behavior.WOUNDED;
          break;
        }

        break;
      }
      case Grass.Behavior.UNLOADING: {
        this.bloomTicks--;
        this.loading = this.bloomTicks / grassBloomTimeTicks;
        if (this.bloomTicks === 0) {
          this.currentBehavior = Grass.Behavior.LIGHT;
          break;
        }

        break;
      }
      case Grass.Behavior.WOUNDED: {
        this.healthPoints--;
        if (this.healthPoints === 0) {
          this.currentBehavior = Grass.Behavior.DEAD;
          game.emit("change", "grass-dead", { id: this.id });
          this.delete();
        }
        break;
      }
      case Grass.Behavior.BLOOM: {
        break;
      }
      default: {
        throw new Error(`missing behavior implementation: ${this.currentBehavior}`);
      }
    }
  }

  checkOrbs(gameState) {
    if (!this.isTouchingAnyOrb(gameState)) {
      this.clearOrb();
      return;
    }
    const orbs = this.sortByDistance(gameState.liveOrbs()).filter((orb) => !orb.loadingGrass);
    if (orbs.length === 0) {
      this.clearOrb();
      return;
    }
    const closestOrb = orbs[0].entity;
    if (this.isTouching(closestOrb)) {
      if (closestOrb !== this.orb) {
        this.clearOrb();
        this.orb = closestOrb;
        this.orb.loadingGrass = this;
      }
    }
  }

  clearOrb() {
    if (this.orb) {
      this.orb.loadingGrass = null;
      this.orb = null;
    }
  }

  isLuminous() {
    return this.currentBehavior !== Grass.Behavior.NORMAL && this.currentBehavior !== Grass.Behavior.WOUNDED;
  }
}

module.exports = Grass;
