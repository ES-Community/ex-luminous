"use strict";

// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

// Require Third-party Dependencies
const THREE = require("three");

class LightBehavior extends ScriptBehavior {
  constructor(defaultLight = 0x282208, radiusLight = 80, range = 1, decay = 10) {
    super();
    this.defaultLight = defaultLight;
    this.radiusLight = radiusLight;
    this.range = range;
    this.decay = decay;
  }

  awake() {
    this.light = new THREE.PointLight(this.defaultLight, 2, this.radiusLight * 4, this.decay);
    this.light.position.set(0, 2, 0);
    this.actor.threeObject.add(this.light);

    this.timer = 0;
    this.speedMove = 0.01;
  }

  update() {
    this.light.intensity = Math.cos(this.timer * this.speedMove * 2) * this.range + 4;
    this.timer++;
  }
}

module.exports = LightBehavior;
