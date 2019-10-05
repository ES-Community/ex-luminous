"use strict";

const getId = require("../utils/getId");
const mandatory = require("../utils/mandatoryParam");

class Entity {
  static SIZE = 0.25;

  constructor(position = mandatory("position"), healthPoints = mandatory("healthPoints")) {
    this.id = getId();
    this.position = position;
    this.healthPoints = healthPoints;
  }

  distanceTo(other) {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2;
  }

  isTouching(other) {
    return this.distanceTo(other) <= Entity.SIZE;
  }

  update() {
    throw new Error("Entities must implement the update(state) method");
  }
}

module.exports = Entity;
