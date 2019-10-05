"use strict";

let id = 0;

function getId() {
  return id++;
}

module.exports = getId;
