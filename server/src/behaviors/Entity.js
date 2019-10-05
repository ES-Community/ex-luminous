"use strict";

const getId = require("../utils/getId");
const mandatory = require("../utils/mandatoryParam");

class Entity {
  constructor(position = mandatory("position"), healthPoints = mandatory("healthPoints")) {
    this.id = getId();
    this.position = position;
    this.healthPoints = healthPoints;
  }
}

module.exports = Entity;
