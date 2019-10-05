"use strict";

const { TICKS_PER_SECOND } = require("../config");

function ticksToTime(ticks) {
  return (ticks * 1000) / TICKS_PER_SECOND;
}

function timeToTicks(time) {
  return (time * TICKS_PER_SECOND) / 10000;
}

module.exports = {
  ticksToTime,
  timeToTicks
};
