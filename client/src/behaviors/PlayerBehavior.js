// Require Internal Dependencies
const ScriptBehavior = require("../class/ScriptBehavior");

class PlayerBehavior extends ScriptBehavior {
  awake() {
    console.log("player awake!");
  }

  update() {

  }
}

module.exports = PlayerBehavior;
