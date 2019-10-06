"use strict";

const { GRASS_LIGHT_TIMEOUT, GRASS_LOAD_DELAY, GRASS_MAX_HP, GRASS_BLOOM_TIME } = require("../config");
const { timeToTicks } = require("../utils/convertTicks");

const Entity = require("./Entity");

const grassLightTimeoutTicks = Math.round(timeToTicks(GRASS_LIGHT_TIMEOUT));
const grassLoadDelayTicks = Math.round(timeToTicks(GRASS_LOAD_DELAY));
const grassBloomTimeTicks = Math.round(timeToTicks(GRASS_BLOOM_TIME));

class Grass extends Entity {
  static State = {
    NORMAL: "NORMAL",
    LIGHT: "LIGHT",
    LOADING: "LOADING",
    UNLOADING: "UNLOADING",
    BLOOM: "BLOOM",
    WOUNDED: "WOUNDED",
    DEAD: "DEAD"
  };

  constructor(position) {
    super(position, GRASS_MAX_HP);

    this.state = Grass.State.NORMAL;
    this.bloomTicks = 0;
    this.loading = 0;
    this.orbContact = 0;
    this.lightTicks = 0;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      state: this.state,
      loading: this.loading
    };
  }

  update(gameState) {
    switch (this.state) {
      case Grass.State.NORMAL: {
        if (this.isTouchingAnyOrb(gameState)) {
          this.state = Grass.State.LIGHT;
          this.lightTicks = grassLightTimeoutTicks;
        }
        break;
      }
      case Grass.State.LIGHT: {
        if (!this.isTouchingAnyOrb(gameState) && --this.lightTicks === 0) {
          this.state = Grass.State.NORMAL;
        } else if (this.isTouchingAnyShadow(gameState)) {
          this.state = Grass.State.WOUNDED;
        } else if (this.isTouchingAnyOrb(gameState)) {
          this.lightTicks = grassLightTimeoutTicks;
          if (++this.orbContact === grassLoadDelayTicks) {
            this.orbContact = 0;
            this.state = Grass.State.LOADING;
          }
        }
        break;
      }
      case Grass.State.LOADING: {
        if (!this.isTouchingAnyOrb(gameState)) {
          this.state = Grass.State.UNLOADING;
        } else if (++this.bloomTicks === grassBloomTimeTicks) {
          this.state = Grass.State.BLOOM;
        } else if (this.isTouchingAnyShadow(gameState)) {
          this.state = Grass.State.WOUNDED;
        }
        break;
      }
      case Grass.State.UNLOADING: {
        if (--this.bloomTicks === 0) {
          this.state = Grass.State.LIGHT;
        }
        break;
      }
      case Grass.State.WOUNDED: {
        this.healthPoints--;
        if (this.healthPoints === 0) {
          this.state = Grass.State.DEAD;
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

  isTouchingAnyShadow(gameState) {
    return gameState.shadows.some((shadow) => this.isTouching(shadow));
  }
}

module.exports = Grass;
