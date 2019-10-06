"use strict";

const { MAP_SIZE_X, MAP_SIZE_Z } = require("../config");

function randomCoordinates() {
  return {
    x: randomInt(MAP_SIZE_X * 2 -2),
    z: randomInt(MAP_SIZE_Z * 2 -2)
  };
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = randomCoordinates;
