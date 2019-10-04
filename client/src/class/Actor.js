// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const ScriptBehavior = require("./ScriptBehavior");

class Actor {
    constructor(name) {
      if (typeof name !== "string") {
        throw new TypeError("name must be a string");
      }

      this.name = name;
      this.threeObject = new THREE.Object3D();
      this.threeObject.name = name;
      this.behaviors = [];
    }

    addScriptedBehavior(component) {
      if (!(component instanceof ScriptBehavior)) {
        throw new TypeError("component must be extended from ScriptBehavior");
      }

      component.actor = this;
      this.behaviors.push(component);
    }

    triggerBehaviorEvent(name = "update") {
      if (!ScriptBehavior.AvailableMethods.has(name)) {
        return;
      }

      for (const component of this.behaviors) {
        component[name]();
      }
    }
}

module.exports = Actor;
