/* @flow */

import React from 'react';
import * as THREE from 'three';

import { calculateBoundingRectangle } from './utils';

export default class Box extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static defaultProps = {
    opacity: 0.5,
    z: 1,
    x: 0,
    y: 0,
  };

  props: {
    color: number | string;
    x: number;
    y: number;
    z: number;
    opacity: number;
    width: number;
    height: number;
  };

  render() {
    const { color, z, opacity, width, height, x, y } = this.props;

    const boundingRectangle = calculateBoundingRectangle(
      0,
      0,
      width,
      height,
      x,
      y,
    );

    return (
      <object3D position={new THREE.Vector3(boundingRectangle.left, boundingRectangle.top, 0)}>
        <mesh renderOrder={z}>
          <planeGeometry width={boundingRectangle.width} height={boundingRectangle.height} />
          <meshBasicMaterial color={color} opacity={opacity} transparent />
        </mesh>
      </object3D>
    );
  }
}
