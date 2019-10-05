
const THREE = require("three");

const Grid = {
    async generateGrid(sizeX, sizeY, scene) {

        const gridSize = sizeX * sizeY * 5;
        var geometry = new THREE.BoxGeometry(4, 4, 4);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        let initialX = -50;
        let initialZ = -50;
        let compteur = 0;
        for (i = 0; i < gridSize; i++) {
            var cube = new THREE.Mesh(geometry, material);

            if (initialZ == 50) {
                initialX = initialX + 4;
                initialZ = -50;
            }
            cube.position.x = initialX + 2;
            cube.position.z = initialZ + 2;
            await scene.add(cube);

            if (compteur == 10) {
                compteur = 0;
            }
            initialZ = initialZ + 4;
            compteur++
        }
    }

}

module.exports = Grid;