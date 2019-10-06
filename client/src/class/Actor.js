"use strict";

// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const ScriptBehavior = require("./ScriptBehavior");

// Variables
const tmpMatrix = new THREE.Matrix4();
const tmpVector3 = new THREE.Vector3();
const tmpQuaternion = new THREE.Quaternion();

class Actor {
  constructor(name, parent = null, options = {}) {
    if (typeof name !== "string") {
      throw new TypeError("name must be a string");
    }
    const { visible = true } = options;

    this.name = name;
    this.parent = parent instanceof Actor ? parent : null;
    this.threeObject = new THREE.Object3D();
    this.threeObject.name = name;
    this.threeObject.visible = visible;
    this.threeObject.userData.isActor = true;

    /** @type {Actor[]} */
    this.childrens = [];
    this.behaviors = [];

    if (this.parent !== null) {
      this.parent.childrens.push(this);
      this.parent.threeObject.add(this.threeObject);
      this.threeObject.updateMatrixWorld(false);
    }
  }

  getChildrenActorByName(name) {
    for (const actor of this.childrens) {
      if (actor.name === name) {
        return actor;
      }

      const childActor = actor.getChildrenActorByName(name);
      if (childActor !== null) {
        return childActor;
      }
    }

    return null;
  }

  addScriptedBehavior(component) {
    if (!(component instanceof ScriptBehavior)) {
      throw new TypeError("component must be extended from ScriptBehavior");
    }

    component.actor = this;
    this.behaviors.push(component);
  }

  getBehaviorByName(behaviorName) {
    return this.behaviors.find((component) => component.constructor.name === behaviorName);
  }

  triggerBehaviorEvent(name = "update") {
    if (!ScriptBehavior.AvailableMethods.has(name)) {
      return;
    }

    for (const component of this.behaviors) {
      component[name]();
    }
  }

  // Transform
  getGlobalMatrix(matrix) {
    return matrix.copy(this.threeObject.matrixWorld);
  }
  getGlobalPosition(position) {
    return position.setFromMatrixPosition(this.threeObject.matrixWorld);
  }
  getGlobalOrientation(orientation) {
    return orientation
      .set(0, 0, 0, 1)
      .multiplyQuaternions(this.getParentGlobalOrientation(tmpQuaternion), this.threeObject.quaternion);
  }
  getGlobalEulerAngles(angles) {
    return angles.setFromQuaternion(this.getGlobalOrientation(tmpQuaternion));
  }
  getLocalPosition(position) {
    return position.copy(this.threeObject.position);
  }
  getLocalOrientation(orientation) {
    return orientation.copy(this.threeObject.quaternion);
  }
  getLocalEulerAngles(angles) {
    return angles.setFromQuaternion(this.threeObject.quaternion);
  }
  getLocalScale(scale) {
    return scale.copy(this.threeObject.scale);
  }

  getParentGlobalOrientation() {
    let ancestorOrientation = new THREE.Quaternion();
    let ancestorActor = this.threeObject;
    while (ancestorActor.parent != null) {
      ancestorActor = ancestorActor.parent;
      ancestorOrientation.multiplyQuaternions(ancestorActor.quaternion, ancestorOrientation);
    }
    return ancestorOrientation;
  }

  setGlobalMatrix(matrix) {
    matrix.multiplyMatrices(new THREE.Matrix4().getInverse(this.threeObject.parent.matrixWorld), matrix);
    matrix.decompose(this.threeObject.position, this.threeObject.quaternion, this.threeObject.scale);
    this.threeObject.updateMatrixWorld(false);
  }

  setGlobalPosition(pos) {
    if (this.threeObject.parent !== null) {
      this.threeObject.parent.worldToLocal(pos);
    }
    this.threeObject.position.set(pos.x, pos.y, pos.z);
    this.threeObject.updateMatrixWorld(false);
  }

  setLocalPosition(pos) {
    this.threeObject.position.copy(pos);
    this.threeObject.updateMatrixWorld(false);
  }

  lookAt(target, up = this.threeObject.up) {
    const m = new THREE.Matrix4();
    m.lookAt(this.getGlobalPosition(tmpVector3), target, up);
    this.setGlobalOrientation(tmpQuaternion.setFromRotationMatrix(m));
  }

  lookTowards(direction, up) {
    this.lookAt(this.getGlobalPosition(tmpVector3).sub(direction), up);
  }

  setLocalOrientation(quaternion) {
    this.threeObject.quaternion.copy(quaternion);
    this.threeObject.updateMatrixWorld(false);
  }

  setGlobalOrientation(quaternion) {
    const inverseParentQuaternion = new THREE.Quaternion()
      .setFromRotationMatrix(tmpMatrix.extractRotation(this.threeObject.parent.matrixWorld))
      .inverse();
    quaternion.multiplyQuaternions(inverseParentQuaternion, quaternion);
    this.threeObject.quaternion.copy(quaternion);
    this.threeObject.updateMatrixWorld(false);
  }

  setLocalEulerAngles(eulerAngles) {
    this.threeObject.quaternion.setFromEuler(eulerAngles);
    this.threeObject.updateMatrixWorld(false);
  }

  setGlobalEulerAngles(eulerAngles) {
    const globalQuaternion = new THREE.Quaternion().setFromEuler(eulerAngles);
    const inverseParentQuaternion = new THREE.Quaternion()
      .setFromRotationMatrix(tmpMatrix.extractRotation(this.threeObject.parent.matrixWorld))
      .inverse();
    globalQuaternion.multiplyQuaternions(inverseParentQuaternion, globalQuaternion);
    this.threeObject.quaternion.copy(globalQuaternion);
    this.threeObject.updateMatrixWorld(false);
  }

  setLocalScale(scale) {
    this.threeObject.scale.copy(scale);
    this.threeObject.updateMatrixWorld(false);
  }

  rotateGlobal(quaternion) {
    this.getGlobalOrientation(tmpQuaternion);
    tmpQuaternion.multiplyQuaternions(quaternion, tmpQuaternion);
    this.setGlobalOrientation(tmpQuaternion);
  }

  rotateLocal(quaternion) {
    this.threeObject.quaternion.multiplyQuaternions(quaternion, this.threeObject.quaternion);
    this.threeObject.updateMatrixWorld(false);
  }

  rotateGlobalEulerAngles(eulerAngles) {
    const quaternion = new THREE.Quaternion().setFromEuler(eulerAngles);
    this.rotateGlobal(quaternion);
  }

  rotateLocalEulerAngles(eulerAngles) {
    const quaternion = new THREE.Quaternion().setFromEuler(eulerAngles);
    this.threeObject.quaternion.multiplyQuaternions(quaternion, this.threeObject.quaternion);
    this.threeObject.updateMatrixWorld(false);
  }

  moveGlobal(offset) {
    this.getGlobalPosition(tmpVector3).add(offset);
    this.setGlobalPosition(tmpVector3);
  }

  moveLocal(offset) {
    this.threeObject.position.add(offset);
    this.threeObject.updateMatrixWorld(false);
  }

  moveOriented(offset) {
    offset.applyQuaternion(this.threeObject.quaternion);
    this.threeObject.position.add(offset);
    this.threeObject.updateMatrixWorld(false);
  }
}

module.exports = Actor;
