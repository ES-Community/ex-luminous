"use strict";

// Require Third-party Dependencies
const THREE = require("three");

// Cube textures
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material2 = new THREE.MeshBasicMaterial({ color: new THREE.Color(30, 100, 50) });

const Grid = {
  cubeSize: 4,
  defaultYPosition: 0,
  createCubeMesh() {
    const geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);

    return new THREE.Mesh(geometry, material);
  },
  generateGrid(sizeX, sizeY, scene) {
    const gridSize = sizeX * sizeY * 6.25;
    const geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);

    let initialX = -50;
    let initialZ = -50;
    let compteur = 0;
    for (let i = 0; i < gridSize; i++) {
      var cube = new THREE.Mesh(geometry, material);

      if (initialZ == 50) {
        initialX = initialX + 4;
        initialZ = -50;
      }
      cube.position.x = initialX + 2;
      cube.position.z = initialZ + 2;
      scene.add(cube);

      if (compteur == 10) {
        compteur = 0;
      }
      initialZ = initialZ + 4;
      compteur++;
    }
  },
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
