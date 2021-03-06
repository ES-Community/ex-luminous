"use strict";

module.exports = {
  /**
   * Number of game ticks per second.
   * Everything is updated at each tick and the new state is sent to the clients.
   */
  TICKS_PER_SECOND: 120,

  MAP_SIZE_X: 64,
  MAP_SIZE_Z: 24,

  /**
   * Number of shadows spawned when the game starts.
   */
  INIT_SHADOW_COUNT: 10,

  /**
   * Number of grass spawned when the game starts.
   */
  INIT_GRASS_COUNT: 50,

  ENTITY_DEFAULT_RADIUS: 0.5,

  /**
   * Time during which the grass emits light after it lost contact with a player.
   */
  GRASS_LIGHT_TIMEOUT: 4,

  /**
   * Time that a player must be in contact with a grass until it starts loading.
   */
  GRASS_LOAD_DELAY: 3,

  /**
   * Time during which the grass must be loading until it blooms.
   */
  GRASS_BLOOM_TIME: 8,

  GRASS_WOUND_TIME: 1,

  GRASS_MAX_HP: 3,

  GRASS_RADIUS: 0.5,

  /**
   * Time that a player must be in contact with a player until it starts loading the respawn.
   */
  ORB_LOAD_DELAY: 4,

  /**
   * Time during which the grass must be loading until it respawn.
   */
  ORB_RESPAWN_TIME: 8,

  ORB_RADIUS: 0.2,

  ORB_MAX_HP: 1,

  SHADOW_NORMAL_VISION_RADIUS: 2,
  SHADOW_HUNTING_VISION_RADIUS: 4,
  SHADOW_MAX_HP: 3,
  SHADOW_MIN_WANDERING_TIME: 2,
  SHADOW_MAX_WANDERING_TIME: 4,
  SHADOW_MAX_WAITING_TIME: 5,
  SHADOW_MIN_WAITING_TIME: 2,
  SHADOW_SPEED: 1.2,
  SHADOW_RADIUS: 0.1
};
