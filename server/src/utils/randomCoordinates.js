"use strict";

const { MAP_SIZE_X, MAP_SIZE_Z } = require("../config");

function randomCoordinates() {
  return {
    x: randomFloat(MAP_SIZE_X * 2 -4),
    z: randomFloat(MAP_SIZE_Z * 2 -4)
  };
}

function randomFloat(max) {
  return Math.random() * max;
}

module.exports = randomCoordinates;
