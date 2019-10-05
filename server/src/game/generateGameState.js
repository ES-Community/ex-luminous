"use strict";

const Grass = require("../behaviors/Grass");
const getId = require("../utils/getId");

const MAP_SIZE_X = 64;
const MAP_SIZE_Y = 64;
const SHADOW_MAX_HP = 1;
const ORB_MAX_HP = 1;
const INIT_SHADOW_COUNT = 10;
const INIT_GRASS_COUNT = 15;

const totalTiles = MAP_SIZE_X * MAP_SIZE_Y;

function generateGameState() {
  return {
    gameTicks: 0,
    mapSize: {
      x: MAP_SIZE_X,
      y: MAP_SIZE_Y
    },
    gameStep: 1,
    shadows: generateShadows(),
    orbs: [],
    grass: generateGrass()
  };
}

function generateShadows() {
  const shadows = [];
  for (let i = 0; i < INIT_SHADOW_COUNT; i++) {
    const shadow = {
      id: getId(),
      ...randomCoordinates(),
      healthPoints: SHADOW_MAX_HP,
      behavior: "normal"
    };

    while (coordinatesAreUsed(shadow, shadows)) {
      Object.assign(shadow, randomCoordinates());
    }

    shadows.push(shadow);
  }
  return shadows;
}

function generateGrass() {
  const grasses = [];
  for (let i = 0; i < INIT_GRASS_COUNT; i++) {
    const grass = new Grass(randomCoordinates());

    while (coordinatesAreUsed(grass, grasses)) {
      Object.assign(grass, randomCoordinates());
    }

    grasses.push(grass);
  }
  return grasses;
}

function randomCoordinates() {
  return {
    x: randomInt(MAP_SIZE_X),
    y: randomInt(MAP_SIZE_Y)
  };
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function coordinatesAreUsed(object, objects) {
  for (const other of objects) {
    if (object.x === other.x && object.y === other.y) {
      return true;
    }
  }
  return false;
}

module.exports = generateGameState;
