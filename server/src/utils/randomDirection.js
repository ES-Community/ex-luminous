"use strict"

const DIRECTIONS = [
  0,
  Math.PI / 4,
  Math.PI / 2,
  (3 * Math.PI) / 4,
  Math.PI,
  (5 * Math.PI) / 4,
  (3 * Math.PI) / 2,
  (7 * Math.PI) / 4
];

// return a random direction in radians
function randomDirection () {
  return Math.floor(Math.random() * Math.floor(DIRECTIONS.length));
}

module.exports = randomDirection;