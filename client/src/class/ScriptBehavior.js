"use strict";

// eslint-disable-next-line
const Actor = require("./Actor");

const voidFunction = () => undefined;

class ScriptBehavior {
  constructor() {
    /** @type {Actor} */
    this.actor = null;

    for (const methodName of ScriptBehavior.AvailableMethods) {
      if (typeof this[methodName] !== "function") {
        this[methodName] = voidFunction();
      }
    }
  }

  destroy() {
    if (this.actor === null) {
      return;
    }

    const selfIndex = this.actor.behaviors.indexOf(this);
    this.actor.behaviors.splice(selfIndex, 1);
  }
}

ScriptBehavior.AvailableMethods = new Set(["awake", "update", "destroy"]);

module.exports = ScriptBehavior;
