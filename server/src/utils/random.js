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
    x: randomFloat(MAP_SIZE_X),
    z: randomFloat(MAP_SIZE_Z)
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
