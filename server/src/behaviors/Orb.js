"use strict";

const randomCoordinates = require("../utils/randomCoordinates");

const Entity = require("./Entity");

const ORB_MAX_HP = 1;

class Orb extends Entity {
  constructor(name) {
    super(randomCoordinates(), ORB_MAX_HP);

    this.name = name;
    this.huntedBy = [];
    this.interactingWith = null;
  }

  update(gameState) {}
}

module.exports = Orb;
