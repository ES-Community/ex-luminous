"use strict";

let id = 1;

function getId() {
  return id++;
}

module.exports = getId;
