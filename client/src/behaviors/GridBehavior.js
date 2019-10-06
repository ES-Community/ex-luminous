"use strict";

// Require Third-party Dependencies
const THREE = require("three");

// Grass textures
const GroundGrass = new THREE.TextureLoader().load("../assets/textures/Ground-Grass.png");
const GroundGrass2 = new THREE.TextureLoader().load("../assets/textures/Ground-Grass_v2.png");

// Cube textures
const material = new THREE.MeshPhongMaterial({
  map: GroundGrass
});
const material2 = new THREE.MeshPhongMaterial({
  map: GroundGrass2
});

const Grid = {
  cubeSize: 4,
  defaultYPosition: 0,
  *generateGridEx(sizeX, sizeY) {
    const geometry = new THREE.BoxGeometry(this.cubeSize, 1, this.cubeSize);
    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        const factor = Math.random() > 0.9;
        const cube = new THREE.Mesh(geometry, factor ? material2 : material);
        cube.position.set(x * this.cubeSize, this.defaultYPosition, y * this.cubeSize);

        yield cube;
      }
    }
  }
};

module.exports = Grid;
