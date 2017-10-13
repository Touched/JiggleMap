/* @flow */

import React from 'react';
import * as THREE from 'three';

import { calculateBoundingRectangle } from './utils';

export default class Grid extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static defaultProps = {
    opacity: 0.5,
    z: 1,
    x: 0,
    y: 0,
    color: '#000000',
  };

  componentDidMount() {
    this.buildGrid();
  }

  componentDidUpdate() {
    this.buildGrid();
  }

  props: {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    gridSize: number;
  };

  buildGrid() {
    const { width, height, gridSize } = this.props;
    const geometry = new THREE.Geometry();

    for (let i = 0; i <= height; i += gridSize) {
      geometry.vertices.push(new THREE.Vector3(0, 0, i));
      geometry.vertices.push(new THREE.Vector3(width, 0, i));
    }

    for (let i = 0; i <= width; i += gridSize) {
      geometry.vertices.push(new THREE.Vector3(i, 0, -height));
      geometry.vertices.push(new THREE.Vector3(i, 0, height));
    }

    this.lines.geometry = geometry;
    this.material.gapSize = 1;
    this.material.dashSize = 1;

    geometry.computeLineDistances();
  }

  render() {
    const { z, width, height, x, y } = this.props;

    const size = Math.max(width, height);
    const boundingRectangle = calculateBoundingRectangle(0, 0, size, size, x, y);

    return (
      <lineSegments
        rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
        position={new THREE.Vector3(boundingRectangle.x, boundingRectangle.y, 0)}
        renderOrder={z}
        ref={(ref) => { this.lines = ref; }}
      >
        <lineDashedMaterial color={0x444444} transparent ref={(ref) => { this.material = ref; }} />
      </lineSegments>
    );
  }
}
