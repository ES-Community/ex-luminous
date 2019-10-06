"use strict";

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

module.exports = randomInRange;
