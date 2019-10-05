"use strict";

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

  /**
   * @function findActorByName
   * @param {!string} name
   * @param {!boolean} [lookForActorChildrens]
   * @returns {Actor}
   */
  findActorByName(name, lookForActorChildrens = false) {
    for (const actor of this.actors) {
      if (actor.name === name) {
        return actor;
      }

      if (!lookForActorChildrens) {
        continue;
      }

      const actorChild = actor.getChildrenActorByName(name);
      if (actorChild !== null) {
        return actorChild;
      }
    }

    return null;
  }

  add(object) {
    if (object instanceof Actor) {
      if (object.parent === null) {
        this.actors.push(object);
        this.scene.add(object.threeObject);
      }
    } else {
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
