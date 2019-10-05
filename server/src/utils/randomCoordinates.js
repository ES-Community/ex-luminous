"use strict";

const { MAP_SIZE_X, MAP_SIZE_Z } = require("../config");

function randomCoordinates() {
  return {
    x: randomInt(MAP_SIZE_X),
    z: randomInt(MAP_SIZE_Z)
  };
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = randomCoordinates;
