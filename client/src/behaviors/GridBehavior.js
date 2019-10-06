"use strict";

// Require Third-party Dependencies
const THREE = require("three");

const texture1 = new THREE.TextureLoader().load("../assets/textures/Ground-Grass.png");

// Cube textures
const material = new THREE.MeshPhongMaterial({
  map: texture1
});
const material2 = new THREE.MeshPhongMaterial({
  color: new THREE.Color(30, 100, 50),
  wireframe: true
});

const Grid = {
  cubeSize: 4,
  defaultYPosition: 0,
  *generateGridEx(sizeX, sizeY) {
    const geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
    for (let x = 0; x < sizeX / 2; x++) {
      for (let y = 0; y < sizeY / 2; y++) {
        const factor = Math.random() > 0.9;
        const cube = new THREE.Mesh(geometry, factor ? material2 : material);
        cube.position.set(x * this.cubeSize, this.defaultYPosition, y * this.cubeSize);

        yield cube;
      }
    }
  }
};

module.exports = Grid;
