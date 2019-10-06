"use strict";

const { MAP_SIZE_X, MAP_SIZE_Z } = require("../config");

function randomCoordinates() {
  return {
    x: randomFloat(MAP_SIZE_X),
    z: randomFloat(MAP_SIZE_Z)
  };
}

function randomFloat(max) {
  return Math.random() * max;
}

module.exports = randomCoordinates;
