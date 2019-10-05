"use strict";

const getId = require("../utils/getId");
const mandatory = require("../utils/mandatoryParam");

class Entity {
  static RADIUS = 0.125;

  constructor(position = mandatory("position"), healthPoints = mandatory("healthPoints")) {
    this.id = getId();
    this.position = position;
    this.healthPoints = healthPoints;
  }

  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  isTouching(other) {
    const distance = this.distanceTo(other);
    const radii = this.constructor.radius + other.constructor.radius;
    return distance <= radii;
  }

  update() {
    throw new Error("Entities must implement the update(state) method");
  }
}

module.exports = Entity;
