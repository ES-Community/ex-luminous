"use strict";

const getId = require("./getId");

const MAP_SIZE_X = 64;
const MAP_SIZE_Y = 64;
const SHADOW_MAX_HP = 1;
const ORB_MAX_HP = 1;
const GRASS_MAX_HP = 3;
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

    shadows.push(shadow);
  }
  return shadows;
}

function generateGrass() {
  const grass = [];
  for (let i = 0; i < INIT_GRASS_COUNT; i++) {
    const g = {
      id: getId(),
      ...randomCoordinates(),
      healthPoints: GRASS_MAX_HP,
      state: "normal",
      loading: 0
    };

    grass.push(g);
  }
  return grass;
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

module.exports = generateGameState;
