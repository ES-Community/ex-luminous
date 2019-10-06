"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class GrassBehavior extends ScriptBehavior {
  constructor(initPosition = new THREE.Vector2(0, 0)) {
    super();
    this.defaultPos = initPosition;
  }

  awake() {
    const radiusLight = 5;
    const light = new THREE.PointLight(0xffffff, 5, radiusLight * 4)
    light.position.set(0, 1, 0);
    game.modelLoader.load("Herbe", "Herbe_Neutre.png").then((model) => {
      model.scale.set(0.25, 0.25, 0.25);
      this.actor.threeObject.add(model);
      this.actor.threeObject.add(light);
    });
    this.actor.threeObject.position.set(this.defaultPos.x, 3, this.defaultPos.y);
  }

  update() {}
}

module.exports = GrassBehavior;
