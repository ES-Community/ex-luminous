"use strict";

/**
 * ORIGINAL CODE CREATED BY Elisee MAURER
 * https://github.com/elisee/CraftStudio.js
 */

// Require Third-party Dependencies
const THREE = require("three");

function getNearestKeyframes(keyframes, frame, holdLastKeyframe) {
  if (keyframes.length > 0 && keyframes[keyframes.length - 1].frame <= frame) {
    return {
      previous: keyframes[keyframes.length - 1],
      next: holdLastKeyframe ? keyframes[keyframes.length - 1] : keyframes[0]
    };
  }

  let i, j;
  const ref = keyframes.length;
  for (i = j = 0; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    if (keyframes[i].frame > frame) {
      let nextIndex = i;
      if (nextIndex === 0 && holdLastKeyframe) {
        nextIndex = keyframes.length - 1;
      }

      return {
        previous: keyframes[(i + keyframes.length - 1) % keyframes.length],
        next: keyframes[nextIndex]
      };
    }
  }

  return null;
}

function computeFrameInterpolationFactor(previousFrame, nextFrame, frame, duration) {
  let factor = 0;
  if (nextFrame % duration !== previousFrame % duration || nextFrame > previousFrame) {
    let length = nextFrame - previousFrame;
    if (length < 0) {
      length += duration;
    }
    if (frame < previousFrame) {
      frame += duration;
    }

    factor = (frame - previousFrame) / length;
  }

  return factor;
}

class ModelAnimation {
  constructor(modelAnimDef) {
    this.duration = modelAnimDef.duration;
    this.holdLastKeyframe = modelAnimDef.holdLastKeyframe;
    this.nodeAnimations = {};
    this.animationFrame = 0;

    for (const nodeName in modelAnimDef.nodeAnimations) {
      const nodeAnimData = modelAnimDef.nodeAnimations[nodeName];
      const nodeAnim = {
        positionKeys: [],
        orientationKeys: []
      };
      this.nodeAnimations[nodeName] = nodeAnim;

      for (const frame in nodeAnimData.position) {
        nodeAnim.positionKeys.push({
          frame: parseInt(frame),
          delta: new THREE.Vector3(...nodeAnimData.position[frame])
        });
      }

      for (const frame in nodeAnimData.position) {
        const position = nodeAnimData.position[frame].map((value) => THREE.Math.degToRad(value));
        nodeAnim.orientationKeys.push({
          frame: parseInt(frame),
          delta: new THREE.Quaternion().setFromEuler(new THREE.Euler(...position))
        });
      }
    }
  }

  Dispose() {
    this.nodeAnimations = null;
  }

  GetPositionDelta(nodeName, frame) {
    const nodeAnim = this.nodeAnimations[nodeName];
    if (nodeAnim === null) {
      return new THREE.Vector3();
    }

    const keyframes = getNearestKeyframes(nodeAnim.positionKeys, frame, this.holdLastKeyframe);
    if (keyframes === null) {
      return new THREE.Vector3();
    }

    const factor = computeFrameInterpolationFactor(
      keyframes.previous.frame,
      keyframes.next.frame,
      frame,
      this.duration
    );
    return keyframes.previous.delta.clone().lerp(keyframes.next.delta, factor);
  }

  GetOrientationDelta(nodeName, frame) {
    const nodeAnim = this.nodeAnimations[nodeName];
    if (nodeAnim === null) {
      return new THREE.Quaternion();
    }

    const keyframes = getNearestKeyframes(nodeAnim.orientationKeys, frame, this.holdLastKeyframe);
    if (keyframes === null) {
      return new THREE.Quaternion();
    }

    const factor = computeFrameInterpolationFactor(
      keyframes.previous.frame,
      keyframes.next.frame,
      frame,
      this.duration
    );

    return keyframes.previous.delta.clone().slerp(keyframes.next.delta, factor);
  }
}

module.exports = ModelAnimation;
