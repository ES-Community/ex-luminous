"use strict";

// Require Third-party Dependencies
const THREE = require("three");

// Cube textures
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material2 = new THREE.MeshBasicMaterial({ color: new THREE.Color(30, 100, 50) });

const Grid = {
  cubeSize: 4,
  defaultYPosition: 0,
  *generateGridEx(sizeX, sizeY) {
    const geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);

    for (let x = -sizeX / 2; x < sizeX / 2; x++) {
      for (let y = -sizeY / 2; y < sizeY / 2; y++) {
        const factor = Math.random() > 0.9;
        const cube = new THREE.Mesh(geometry, factor ? material2 : material);
        cube.position.set(x * this.cubeSize, this.defaultYPosition, y * this.cubeSize);

        yield cube;
      }
    }
  }
};

module.exports = Grid;
