"use strict";

const getId = require("../utils/getId");

class Entity {
  constructor(position, healthPoints) {
    this.id = getId()
    this.position = position
    this.healthPoints = healthPoints
  }
}

module.exports = Entity;