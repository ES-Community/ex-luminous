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
    game.modelLoader.load("tree3", "tree3.png").then((model) => {
      model.scale.set(2, 2, 2);
      this.actor.threeObject.add(model);
    });
    this.actor.threeObject.position.set(this.defaultPos.x, 2, this.defaultPos.y);
  }

  update() {}
}

module.exports = GrassBehavior;
