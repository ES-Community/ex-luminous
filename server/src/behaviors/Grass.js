"use strict";

const Entity = require("./Entity");

const GRASS_MAX_HP = 3;

class Grass extends Entity {
  static State = {
    NORMAL: "NORMAL"
  };

  constructor(position) {
    super(position, GRASS_MAX_HP);

    this.state = Grass.State.NORMAL;
    this.loading = 0;
  }
}

module.exports = Grass;
