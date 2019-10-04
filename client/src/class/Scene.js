// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const Actor = require("./Actor");

class Scene {
  constructor() {
    this.scene = new THREE.Scene();

    /** @type {Actor[]} */
    this.actors = [];
  }

  add(object) {
    if (object instanceof Actor) {
      this.actors.push(object);
      this.scene.add(object.threeObject);
    }
    else {
      this.scene.add(object);
    }
  }

  clear() {
    for (const actor of this.actors) {
      actor.triggerBehaviorEvent("destroy");
    }
    this.actors = [];

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }
}

module.exports = Scene;
