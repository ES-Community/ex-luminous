"use strict";

const getId = require("../utils/getId");
const mandatory = require("../utils/mandatoryParam");

class Entity {
  static RADIUS = 0.75;

  constructor(position = mandatory("position"), healthPoints = mandatory("healthPoints")) {
    this.id = getId();
    this.position = position;
    this.healthPoints = healthPoints;
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      healthPoints: this.healthPoints
    };
  }

  distanceTo(other) {
    return Math.hypot(this.position.x - other.position.x, this.position.z - other.position.z);
  }

  isTouching(other) {
    const distance = this.distanceTo(other);
    const radii = this.constructor.RADIUS + other.constructor.RADIUS;
    return distance <= radii;
  }

  update() {
    throw new Error("Entities must implement the update(state) method");
  }
}

module.exports = Entity;
