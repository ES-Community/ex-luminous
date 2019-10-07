"use strict";

/**
 * ORIGINAL CODE CREATED BY Elisee MAURER
 * https://github.com/elisee/CraftStudio.js
 */

// Require Third-party Dependencies
const THREE = require("three");

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
    this.leftTopBack = new THREE.Vector3();
    this.rightTopBack = new THREE.Vector3();
    this.rightBottomBack = new THREE.Vector3();
    this.leftBottomBack = new THREE.Vector3();
    this.rightTopFront = new THREE.Vector3();
    this.leftTopFront = new THREE.Vector3();
    this.leftBottomFront = new THREE.Vector3();
    this.rightBottomFront = new THREE.Vector3();

    this.v1 = new THREE.Vector3();
    this.v2 = new THREE.Vector3();

    this.frontNormal = new THREE.Vector3();
    this.backNormal = new THREE.Vector3();
    this.rightNormal = new THREE.Vector3();
    this.bottomNormal = new THREE.Vector3();
    this.leftNormal = new THREE.Vector3();
    this.topNormal = new THREE.Vector3();
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
    var box, boxIndex, j, len, ref;
    boxIndex = 0;
    ref = this.model.rootBoxes;
    for (j = 0, len = ref.length; j < len; j++) {
      box = ref[j];
      boxIndex += this.poseBoxRecurse(
        this.geometry,
        boxIndex,
        box,
        new THREE.Matrix4(),
        this.material.map,
        modelAnimation,
        frame
      );
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
    this.geometry.attributes.uv.needsUpdate = true;
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
    globalBoxMatrix.decompose(transform.position, transform.orientation, {});

    return transform;
  }

  createGeometry(boxCount) {
    let i;
    let asc, end;
    let asc1, end1;
    const geometry = new THREE.BufferGeometry();
    geometry.dynamic = true;
    geometry.attributes = {
      index: { itemSize: 1, array: new Uint16Array(boxCount * 36) },
      position: { itemSize: 3, array: new Float32Array(boxCount * 72) },
      normal: { itemSize: 3, array: new Float32Array(boxCount * 72) },
      uv: { itemSize: 2, array: new Float32Array(boxCount * 48) }
    };

    // Split indices in groups for GPU submission
    const bufChunkDivider = 6; // FIXME: Why 6, past me? because quad?
    const bufChunkSize = Math.floor((0xffff + 1) / bufChunkDivider);
    const indices = geometry.attributes.index.array;

    const quads = boxCount * 6;
    const triangles = quads * 2;

    for (i = 0, end = quads, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      indices[i * 6 + 0] = (i * 4 + 0) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 1] = (i * 4 + 1) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 2] = (i * 4 + 2) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 3] = (i * 4 + 0) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 4] = (i * 4 + 2) % (bufChunkSize * bufChunkDivider);
      indices[i * 6 + 5] = (i * 4 + 3) % (bufChunkSize * bufChunkDivider);
    }

    geometry.groups = [];
    const offsets = (triangles * 3) / (((bufChunkSize * bufChunkDivider) / 4) * 6);

    for (i = 0, end1 = offsets, asc1 = 0 <= end1; asc1 ? i < end1 : i > end1; asc1 ? i++ : i--) {
      const offset = {
        materialIndex: i * bufChunkSize * bufChunkDivider,
        start: ((i * bufChunkSize * bufChunkDivider) / 4) * 6,
        count: Math.min(
          ((bufChunkSize * bufChunkDivider) / 4) * 6,
          triangles * 3 - ((i * bufChunkSize * bufChunkDivider) / 4) * 6
        )
      };

      geometry.groups.push(offset);
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
      ({ position, orientation } = box);
    }

    const origin = box.offsetFromPivot
      .clone()
      .applyQuaternion(orientation)
      .add(position);
    const boxMatrix = new THREE.Matrix4().makeRotationFromQuaternion(orientation).setPosition(origin);
    boxMatrix.multiplyMatrices(parentMatrix, boxMatrix);

    // Vertex positions
    this.leftTopBack.copy(box.vertexCoords[0]).applyMatrix4(boxMatrix);
    this.rightTopBack.copy(box.vertexCoords[1]).applyMatrix4(boxMatrix);
    this.rightBottomBack.copy(box.vertexCoords[2]).applyMatrix4(boxMatrix);
    this.leftBottomBack.copy(box.vertexCoords[3]).applyMatrix4(boxMatrix);
    this.rightTopFront.copy(box.vertexCoords[4]).applyMatrix4(boxMatrix);
    this.leftTopFront.copy(box.vertexCoords[5]).applyMatrix4(boxMatrix);
    this.leftBottomFront.copy(box.vertexCoords[6]).applyMatrix4(boxMatrix);
    this.rightBottomFront.copy(box.vertexCoords[7]).applyMatrix4(boxMatrix);

    // Face normals
    this.frontNormal
      .crossVectors(
        this.v1.subVectors(this.leftBottomFront, this.leftTopFront),
        this.v2.subVectors(this.rightTopFront, this.leftTopFront)
      )
      .normalize();
    this.backNormal
      .crossVectors(
        this.v1.subVectors(this.rightBottomBack, this.rightTopBack),
        this.v2.subVectors(this.leftTopBack, this.rightTopBack)
      )
      .normalize();
    this.rightNormal
      .crossVectors(
        this.v1.subVectors(this.rightBottomFront, this.rightTopFront),
        this.v2.subVectors(this.rightTopBack, this.rightTopFront)
      )
      .normalize();
    this.bottomNormal
      .crossVectors(
        this.v1.subVectors(this.leftBottomBack, this.leftBottomFront),
        this.v2.subVectors(this.rightBottomFront, this.leftBottomFront)
      )
      .normalize();
    this.leftNormal
      .crossVectors(
        this.v1.subVectors(this.leftBottomBack, this.leftTopBack),
        this.v2.subVectors(this.leftTopFront, this.leftTopBack)
      )
      .normalize();
    this.topNormal
      .crossVectors(
        this.v1.subVectors(this.leftTopFront, this.leftTopBack),
        this.v2.subVectors(this.rightTopBack, this.leftTopBack)
      )
      .normalize();

    // Setup faces
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;

    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 0 * 4, this.rightTopFront, this.leftTopFront, this.leftBottomFront, this.rightBottomFront, this.frontNormal); // Front
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 1 * 4, this.leftTopBack, this.rightTopBack, this.rightBottomBack, this.leftBottomBack, this.backNormal); // Back
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 2 * 4, this.rightTopBack, this.rightTopFront, this.rightBottomFront, this.rightBottomBack, this.rightNormal ); // Right
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 3 * 4, this.rightBottomFront, this.leftBottomFront, this.leftBottomBack, this.rightBottomBack, this.bottomNormal); // Bottom
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 4 * 4, this.leftTopFront, this.leftTopBack, this.leftBottomBack, this.leftBottomFront, this.leftNormal); // Left
    // prettier-ignore
    this.setupFace(positions, normals, boxIndex * 24 + 5 * 4, this.rightTopBack, this.leftTopBack, this.leftTopFront, this.rightTopFront, this.topNormal); // Top

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

    const uvs = geometry.attributes.uv.array;
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
    for (let childBox of Array.from(box.children)) {
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
