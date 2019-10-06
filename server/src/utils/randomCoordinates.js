"use strict";

const { MAP_SIZE_X, MAP_SIZE_Z } = require("../config");

function randomCoordinates() {
  return {
    x: randomInt(MAP_SIZE_X * 2 -4),
    z: randomInt(MAP_SIZE_Z * 2 -4)
  };
}

function randomFloat(max) {
  return Math.random() * max;
}

module.exports = randomCoordinates;
