"use strict";

function getIp(call) {
  return call.getPeer().split(":")[1];
}

module.exports = getIp;
