"use strict";

const { MAP_SIZE_X, MAP_SIZE_Z } = require("../config");
const getId = require("../utils/getId");
const mandatory = require("../utils/mandatoryParam");

class Entity {
  static RADIUS = 0.5;

  constructor(position = mandatory("position"), healthPoints = mandatory("healthPoints")) {
    this.id = getId();
    this.position = position;
    this.healthPoints = healthPoints;
    this.deleted = false;
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      healthPoints: this.healthPoints
    };
  }

  delete() {
    this.deleted = true;
  }

  moveTo(newPosition) {
    this.position.x = Math.max(0, Math.min(MAP_SIZE_X, newPosition.x));
    this.position.z = Math.max(0, Math.min(MAP_SIZE_Z, newPosition.z));
  }

  distanceTo(other) {
    return Math.hypot(this.position.x - other.position.x, this.position.z - other.position.z);
  }

  isTouching(other) {
    const distance = this.distanceTo(other);
    const radii = this.constructor.RADIUS + other.constructor.RADIUS;
    return distance <= radii;
  }

  sortByDistance(others) {
    const list = others.map((entity) => ({ entity, distance: this.distanceTo(entity) }));
    return list.sort((e1, e2) => e1 - e2);
  }

  update() {
    throw new Error("Entities must implement the update(gameState) method");
  }
}

module.exports = Entity;
