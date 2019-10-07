"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class GrassBehavior extends ScriptBehavior {
  static CreateLight(radius = 3, visible = true) {
    const light = new THREE.PointLight(0xffffff, 0.1, radius * game.cubeSize, 3);
    light.position.set(0, 14, 0);
    light.visible = visible;

    return light;
  }

  constructor(initPosition = new THREE.Vector3(0)) {
    super();
    this.defaultPos = initPosition;
  }

  awake() {
    game.modelLoader.load("Herbe", "Herbe_Neutre.png").then((model) => {
      this.actor.threeObject.add(model);
      this.actor.threeObject.add(GrassBehavior.CreateLight());
    });
    this.actor.threeObject.position.set(this.defaultPos.x, 1, this.defaultPos.z);
  }

  update() {}
}

module.exports = GrassBehavior;
