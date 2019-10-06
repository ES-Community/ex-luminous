"use strict";

const { MAP_SIZE_X, MAP_SIZE_Z } = require("../config");

function randomFloat(max) {
  return randomFloatInRange(0, max);
}

function randomFloatInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(max) {
  return randomIntInRange(0, max);
}

function randomIntInRange(min, max) {
  return Math.floor(randomFloatInRange(min, max));
}

function randomPosition() {
  return {
    x: randomFloatInRange(1, MAP_SIZE_X - 1),
    z: randomFloatInRange(1, MAP_SIZE_Z - 1)
  };
}

function randomAngle() {
  return randomFloat(2) * Math.PI;
}

module.exports = {
  randomFloat,
  randomFloatInRange,
  randomInt,
  randomIntInRange,
  randomPosition,
  randomAngle
};
