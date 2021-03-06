"use strict";

// Require Third-party Dependencies
const THREE = require("three");

// Grass textures
const GroundGrass = new THREE.TextureLoader().load("../assets/textures/Ground-Grass.png");
const GroundGrassNormale = new THREE.TextureLoader().load("../assets/textures/Ground-Grass-Normale.png");
const GroundGrass2 = new THREE.TextureLoader().load("../assets/textures/Ground-Grass_v2.png");
const GroundGrassNormale2 = new THREE.TextureLoader().load("../assets/textures/Ground-Grass-Normale_v2.png");

// Cube textures
const material = new THREE.MeshStandardMaterial({
  map: GroundGrass,
  normalMap: GroundGrassNormale,
  metalness: 0
});
material.needsUpdate = true;

const material2 = new THREE.MeshStandardMaterial({
  map: GroundGrass2,
  normalMap: GroundGrassNormale2,
  metalness: 0
});
material2.needsUpdate = true;

const Grid = {
  cubeSize: 4,
  defaultYPosition: 0,
  cubeToAdd: 10,
  *generateGridEx(sizeX, sizeY) {
    const geometry = new THREE.BoxGeometry(this.cubeSize, 1, this.cubeSize);
    for (let x = -this.cubeToAdd; x < sizeX + this.cubeToAdd; x++) {
      for (let y = -this.cubeToAdd; y < sizeY + this.cubeToAdd; y++) {
        const factor = Math.random() > 0.75;
        const cube = new THREE.Mesh(geometry, factor ? material2 : material);
        cube.position.set(x * this.cubeSize, this.defaultYPosition, y * this.cubeSize);

        yield cube;
      }
    }
  }
};

module.exports = Grid;
