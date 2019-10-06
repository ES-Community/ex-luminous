"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class GrassBehavior extends ScriptBehavior {
  constructor(initPosition = new THREE.Vector3(0)) {
    super();
    this.defaultPos = initPosition;
  }

  awake() {
    const radiusLight = 10;
    const light = new THREE.PointLight(0xffffff, 7, radiusLight * 4);
    light.position.set(0, 1, 0);
    game.modelLoader.load("Herbe", "Herbe_Neutre.png").then((model) => {
      // model.scale.set(0.25, 0.25, 0.25);
      this.actor.threeObject.add(model);
      this.actor.threeObject.add(light);
    });
    this.actor.threeObject.position.set(this.defaultPos.x, 1, this.defaultPos.z);
  }

  update() {}
}

module.exports = GrassBehavior;
