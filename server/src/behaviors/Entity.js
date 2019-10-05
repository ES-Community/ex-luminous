"use strict";

const getId = require("../game/getId");

class Entity {
    constructor(position, healhPoints) {
        this.id = getId()
        this.position = position
        this.healhPoints = healhPoints
    }
}

module.exports = Entity;