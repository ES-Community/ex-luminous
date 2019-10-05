"use strict";

module.exports = {
  /**
   * Number of game ticks per second.
   * Everything is updated at each tick and the new state is sent to the clients.
   */
  TICKS_PER_SECOND: 1,
  MAP_SIZE_X: 64,
  MAP_SIZE_Z: 64,
  INIT_SHADOW_COUNT: 10,
  INIT_GRASS_COUNT: 15
};
