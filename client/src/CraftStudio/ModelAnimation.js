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
    var delta, frame, nodeAnim, nodeName;
    this.duration = modelAnimDef.duration;
    this.holdLastKeyframe = modelAnimDef.holdLastKeyframe;
    this.nodeAnimations = {};

    for (nodeName in modelAnimDef.nodeAnimations) {
      const nodeAnimData = modelAnimDef.nodeAnimations[nodeName];
      this.nodeAnimations[nodeName] = nodeAnim = {
        positionKeys: [],
        orientationKeys: []
      };
      const ref1 = nodeAnimData.position;
      for (frame in ref1) {
        delta = ref1[frame];
        nodeAnim.positionKeys.push({
          frame: parseInt(frame),
          delta: new THREE.Vector3(delta[0], delta[1], delta[2])
        });
      }

      const ref2 = nodeAnimData.rotation;
      for (frame in ref2) {
        delta = ref2[frame];
        const quaternionDelta = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(THREE.Math.degToRad(delta[0]), THREE.Math.degToRad(delta[1]), THREE.Math.degToRad(delta[2]))
        );
        nodeAnim.orientationKeys.push({
          frame: parseInt(frame),
          delta: quaternionDelta
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
