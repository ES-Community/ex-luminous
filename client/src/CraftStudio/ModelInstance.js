"use strict";

/**
 * ORIGINAL CODE CREATED BY Elisee MAURER
 * https://github.com/elisee/CraftStudio.js
 */

// Require Third-party Dependencies
const THREE = require("three");

// Variables
const leftTopBack = new THREE.Vector3();
const rightTopBack = new THREE.Vector3();
const rightBottomBack = new THREE.Vector3();
const leftBottomBack = new THREE.Vector3();
const rightTopFront = new THREE.Vector3();
const leftTopFront = new THREE.Vector3();
const leftBottomFront = new THREE.Vector3();
const rightBottomFront = new THREE.Vector3();

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();

const frontNormal = new THREE.Vector3();
const backNormal = new THREE.Vector3();
const rightNormal = new THREE.Vector3();
const bottomNormal = new THREE.Vector3();
const leftNormal = new THREE.Vector3();
const topNormal = new THREE.Vector3();

const rootMatrix = new THREE.Matrix4();
const dummyScale = {};

class ModelInstance {
  constructor(model) {
    this.model = model;
    this.geometry = this.createGeometry(this.model.boxCount);
    this.material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0xffffff),
      map: this.model.texture,
      alphaTest: 0.01,
      side: THREE.DoubleSide,
      transparent: model.transparent === true,
      blending: THREE.NormalBlending
    });
    this.ResetPose();
  }

  Dispose() {
    this.model = null;
    this.geometry.dispose();
    this.geometry = null;
    this.material.dispose();
    this.material = null;
  }

  ResetPose() {
    return this.SetPose(null, 0);
  }

  SetPose(modelAnimation, frame) {
    let boxIndex = 0;
    for (let i = 0; i < this.model.rootBoxes.length; i++) {
      // prettier-ignore
      boxIndex += this.poseBoxRecurse(
        this.geometry, boxIndex, this.model.rootBoxes[i], rootMatrix, this.material.map, modelAnimation, frame
      );
    }

    this.geometry.getAttribute("position").needsUpdate = true;
    this.geometry.getAttribute("normal").needsUpdate = true;
    this.geometry.getAttribute("uv").needsUpdate = true;
  }

  GetBoxTransform(boxName, modelAnimation, frame) {
    if (this.model === null) {
      return null;
    }

    const transform = {
      position: new THREE.Vector3(),
      orientation: new THREE.Quaternion()
    };
    let box = this.model.boxesByName[boxName];
    if (box === null) {
      return transform;
    }

    const globalBoxMatrix = new THREE.Matrix4();
    while (box !== null) {
      let orientation, position;
      if (modelAnimation !== null) {
        position = box.position.clone().add(modelAnimation.GetPositionDelta(box.name, frame));
        orientation = new THREE.Quaternion().multiplyQuaternions(
          modelAnimation.GetOrientationDelta(box.name, frame),
          box.orientation
        );
      } else {
        position = box.position;
        orientation = box.orientation;
      }

      const origin = box.offsetFromPivot
        .clone()
        .applyQuaternion(orientation)
        .add(position);
      const boxMatrix = new THREE.Matrix4().makeRotationFromQuaternion(orientation).setPosition(origin);
      globalBoxMatrix.multiplyMatrices(boxMatrix, globalBoxMatrix);
      box = box.parent;
    }
    globalBoxMatrix.decompose(transform.position, transform.orientation, dummyScale);

    return transform;
  }

  createGeometry(boxCount) {
    const geometry = new THREE.BufferGeometry();

    {
      const indexAttribute = new THREE.BufferAttribute(new Uint16Array(boxCount * 36), 1);
      indexAttribute.dynamic = true;

      const positionAttribute = new THREE.BufferAttribute(new Uint16Array(boxCount * 72), 3);
      positionAttribute.dynamic = true;

      const normalAttribute = new THREE.BufferAttribute(new Uint16Array(boxCount * 72), 3);
      normalAttribute.dynamic = true;

      const uvAttribute = new THREE.BufferAttribute(new Uint16Array(boxCount * 48), 2);
      uvAttribute.dynamic = true;

      geometry.setIndex(indexAttribute);
      geometry.addAttribute("position", positionAttribute);
      geometry.addAttribute("normal", normalAttribute);
      geometry.addAttribute("uv", uvAttribute);
    }

    // Split indices in groups for GPU submission
    const bufChunkDivider = 6; // FIXME: Why 6, past me? because quad?
    const bufChunkSize = Math.floor((0xffff + 1) / bufChunkDivider);
    const indices = geometry.getIndex().array;

    const quads = boxCount * 6;
    const asc = 0 <= quads;
    for (let i = 0; asc ? i < quads : i > quads; asc ? i++ : i--) {
      indices[i * 6 + 0] = (i * 4 + 0) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 1] = (i * 4 + 1) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 2] = (i * 4 + 2) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 3] = (i * 4 + 0) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 4] = (i * 4 + 2) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 5] = (i * 4 + 3) % (bufChunkSize * bufChunkDivider);
    }

    geometry.groups = [];
    const triangles = quads * 2;
    const offsets = (triangles * 3) / (((bufChunkSize * bufChunkDivider) / 4) * 6);

    const asc1 = 0 <= offsets;
    for (let i = 0; asc1 ? i < offsets : i > offsets; asc1 ? i++ : i--) {
      const materialIndex = i * bufChunkSize * bufChunkDivider;
      const start = ((i * bufChunkSize * bufChunkDivider) / 4) * 6;
      const count = Math.min(
        ((bufChunkSize * bufChunkDivider) / 4) * 6,
        triangles * 3 - ((i * bufChunkSize * bufChunkDivider) / 4) * 6
      );

      geometry.addGroup(start, count, materialIndex);
    }

    return geometry;
  }

  poseBoxRecurse(geometry, boxIndex, box, parentMatrix, texture, modelAnimation, frame) {
    let orientation, position;
    if (modelAnimation !== null) {
      position = box.position.clone().add(modelAnimation.GetPositionDelta(box.name, frame));
      orientation = new THREE.Quaternion().multiplyQuaternions(
        modelAnimation.GetOrientationDelta(box.name, frame),
        box.orientation
      );
    } else {
      position = box.position;
      orientation = box.orientation;
    }

    const origin = box.offsetFromPivot
      .clone()
      .applyQuaternion(orientation)
      .add(position);
    const boxMatrix = new THREE.Matrix4().makeRotationFromQuaternion(orientation).setPosition(origin);
    boxMatrix.multiplyMatrices(parentMatrix, boxMatrix);

    // Vertex positions
    leftTopBack.copy(box.vertexCoords[0]).applyMatrix4(boxMatrix);
    rightTopBack.copy(box.vertexCoords[1]).applyMatrix4(boxMatrix);
    rightBottomBack.copy(box.vertexCoords[2]).applyMatrix4(boxMatrix);
    leftBottomBack.copy(box.vertexCoords[3]).applyMatrix4(boxMatrix);
    rightTopFront.copy(box.vertexCoords[4]).applyMatrix4(boxMatrix);
    leftTopFront.copy(box.vertexCoords[5]).applyMatrix4(boxMatrix);
    leftBottomFront.copy(box.vertexCoords[6]).applyMatrix4(boxMatrix);
    rightBottomFront.copy(box.vertexCoords[7]).applyMatrix4(boxMatrix);

    // Face normals
    frontNormal
      .crossVectors(v1.subVectors(leftBottomFront, leftTopFront), v2.subVectors(rightTopFront, leftTopFront))
      .normalize();
    backNormal
      .crossVectors(v1.subVectors(rightBottomBack, rightTopBack), v2.subVectors(leftTopBack, rightTopBack))
      .normalize();
    rightNormal
      .crossVectors(v1.subVectors(rightBottomFront, rightTopFront), v2.subVectors(rightTopBack, rightTopFront))
      .normalize();
    bottomNormal
      .crossVectors(v1.subVectors(leftBottomBack, leftBottomFront), v2.subVectors(rightBottomFront, leftBottomFront))
      .normalize();
    leftNormal
      .crossVectors(v1.subVectors(leftBottomBack, leftTopBack), v2.subVectors(leftTopFront, leftTopBack))
      .normalize();
    topNormal
      .crossVectors(v1.subVectors(leftTopFront, leftTopBack), v2.subVectors(rightTopBack, leftTopBack))
      .normalize();

    // Setup faces
    const positions = geometry.getAttribute("position").array;
    const normals = geometry.getAttribute("normal").array;

    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 0 * 4, rightTopFront, leftTopFront, leftBottomFront, rightBottomFront, frontNormal); // Front
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 1 * 4, leftTopBack, rightTopBack, rightBottomBack, leftBottomBack, backNormal); // Back
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 2 * 4, rightTopBack, rightTopFront, rightBottomFront, rightBottomBack, rightNormal ); // Right
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 3 * 4, rightBottomFront, leftBottomFront, leftBottomBack, rightBottomBack, bottomNormal); // Bottom
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 4 * 4, leftTopFront, leftTopBack, leftBottomBack, leftBottomFront, leftNormal); // Left
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 5 * 4, rightTopBack, leftTopBack, leftTopFront, rightTopFront, topNormal); // Top

    // UVs
    const faceOffsets = [
      [box.size.z, box.size.z], // Front
      [box.size.z * 2 + box.size.x, box.size.z], // Back
      [box.size.z + box.size.x, box.size.z], // Right
      [box.size.z + box.size.x, 0], // Bottom
      [0, box.size.z], // Left
      [box.size.z, 0] // Top
    ];

    const faceSizes = [
      [box.size.x, box.size.y], // Front
      [box.size.x, box.size.y], // Back
      [box.size.z, box.size.y], // Right
      [box.size.x, box.size.z], // Bottom
      [box.size.z, box.size.y], // Left
      [box.size.x, box.size.z] // Top
    ];

    const uvs = geometry.getAttribute("uv").array;
    const { width, height } = texture.image;
    for (let i = 0; i < 6; i++) {
      uvs[(boxIndex * 6 + i) * 8 + 0 * 2 + 0] = (faceOffsets[i][0] + box.texOffset[0] + faceSizes[i][0]) / width;
      uvs[(boxIndex * 6 + i) * 8 + 0 * 2 + 1] = 1 - (faceOffsets[i][1] + box.texOffset[1] + 0) / height;

      uvs[(boxIndex * 6 + i) * 8 + 1 * 2 + 0] = (faceOffsets[i][0] + box.texOffset[0] + 0) / width;
      uvs[(boxIndex * 6 + i) * 8 + 1 * 2 + 1] = 1 - (faceOffsets[i][1] + box.texOffset[1] + 0) / height;

      uvs[(boxIndex * 6 + i) * 8 + 2 * 2 + 0] = (faceOffsets[i][0] + box.texOffset[0] + 0) / width;
      uvs[(boxIndex * 6 + i) * 8 + 2 * 2 + 1] = 1 - (faceOffsets[i][1] + box.texOffset[1] + faceSizes[i][1]) / height;

      uvs[(boxIndex * 6 + i) * 8 + 3 * 2 + 0] = (faceOffsets[i][0] + box.texOffset[0] + faceSizes[i][0]) / width;
      uvs[(boxIndex * 6 + i) * 8 + 3 * 2 + 1] = 1 - (faceOffsets[i][1] + box.texOffset[1] + faceSizes[i][1]) / height;
    }

    // Recurse
    boxIndex++;
    let boxCount = 1;
    for (const childBox of box.children) {
      // prettier-ignore
      const childBoxCount = this.poseBoxRecurse(geometry, boxIndex, childBox, boxMatrix, texture, modelAnimation, frame);
      boxIndex += childBoxCount;
      boxCount += childBoxCount;
    }

    return boxCount;
  }

  setupFace(positions, normals, offset, pos0, pos1, pos2, pos3, normal) {
    positions[(offset + 0) * 3 + 0] = pos0.x;
    positions[(offset + 0) * 3 + 1] = pos0.y;
    positions[(offset + 0) * 3 + 2] = pos0.z;

    positions[(offset + 1) * 3 + 0] = pos1.x;
    positions[(offset + 1) * 3 + 1] = pos1.y;
    positions[(offset + 1) * 3 + 2] = pos1.z;

    positions[(offset + 2) * 3 + 0] = pos2.x;
    positions[(offset + 2) * 3 + 1] = pos2.y;
    positions[(offset + 2) * 3 + 2] = pos2.z;

    positions[(offset + 3) * 3 + 0] = pos3.x;
    positions[(offset + 3) * 3 + 1] = pos3.y;
    positions[(offset + 3) * 3 + 2] = pos3.z;

    normals[(offset + 0) * 3 + 0] = normal.x;
    normals[(offset + 0) * 3 + 1] = normal.y;
    normals[(offset + 0) * 3 + 2] = normal.z;

    normals[(offset + 1) * 3 + 0] = normal.x;
    normals[(offset + 1) * 3 + 1] = normal.y;
    normals[(offset + 1) * 3 + 2] = normal.z;

    normals[(offset + 2) * 3 + 0] = normal.x;
    normals[(offset + 2) * 3 + 1] = normal.y;
    normals[(offset + 2) * 3 + 2] = normal.z;

    normals[(offset + 3) * 3 + 0] = normal.x;
    normals[(offset + 3) * 3 + 1] = normal.y;
    normals[(offset + 3) * 3 + 2] = normal.z;
  }
}

module.exports = ModelInstance;
