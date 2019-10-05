"use strict";

const getId = require("../utils/getId");

class Entity {
    constructor(position, healhPoints) {
        this.id = getId()
        this.position = position
        this.healhPoints = healhPoints
    }
}

module.exports = Entity;