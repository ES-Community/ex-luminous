"use strict";

function mandatory(paramName) {
  throw new Error(`Missing mandatory param "${paramName}"`);
}

module.exports = mandatory;
