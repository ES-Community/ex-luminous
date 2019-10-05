"use strict";

module.exports = {
  /**
   * Number of game ticks per second.
   * Everything is updated at each tick and the new state is sent to the clients.
   */
  TICKS_PER_SECOND: 1,
  MAP_SIZE_X: 64,
  MAP_SIZE_Z: 64,
  INIT_SHADOW_COUNT: 1,
  INIT_GRASS_COUNT: 1,

  /**
   * Time during which the grass emits light after it lost contact with a player.
   */
  GRASS_LIGHT_TIMEOUT: 1,

  /**
   * Time that a player must be in contact with a grass until it starts loading.
   */
  GRASS_LOAD_DELAY: 3,
  /**
   * Time during which the grass must be loading until it blooms.
   */
  GRASS_BLOOM_TIME: 5,
  GRASS_MAX_HP: 3
};
