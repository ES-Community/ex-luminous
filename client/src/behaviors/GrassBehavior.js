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
    game.modelLoader.load("Herbe_Neutre", "Herbe_Neutre.png").then((model) => {
      model.scale.set(0.3, 0.3, 0.3);
      this.actor.threeObject.add(model);
    });
    this.actor.threeObject.position.set(this.defaultPos.x, 3, this.defaultPos.y);
  }

  update() {}
}

module.exports = GrassBehavior;
