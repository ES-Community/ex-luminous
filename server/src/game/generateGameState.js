"use strict";

const Grass = require("../behaviors/Grass");
const Shadow = require("../behaviors/Shadow");

const MAP_SIZE_X = 64;
const MAP_SIZE_Z = 64;
const SHADOW_MAX_HP = 1;
const ORB_MAX_HP = 1;
const INIT_SHADOW_COUNT = 10;
const INIT_GRASS_COUNT = 15;

const totalTiles = MAP_SIZE_X * MAP_SIZE_Z;

function generateGameState() {
  return {
    gameTicks: 0,
    mapSize: {
      x: MAP_SIZE_X,
      z: MAP_SIZE_Z
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
    const shadow = new Shadow(randomCoordinates());

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
    z: randomInt(MAP_SIZE_Z)
  };
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function coordinatesAreUsed(object, objects) {
  for (const other of objects) {
    if (object.x === other.x && object.z === other.z) {
      return true;
    }
  }
  return false;
}

module.exports = generateGameState;
