"use strict";

const { TICKS_PER_SECOND } = require("../config");

function ticksToTime(ticks) {
  return ticks / TICKS_PER_SECOND;
}

function timeToTicks(time) {
  return time * TICKS_PER_SECOND;
}

module.exports = {
  ticksToTime,
  timeToTicks
};
