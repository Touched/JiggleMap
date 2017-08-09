import React from 'react';
import * as THREE from 'three';

import { containerShape } from './ContainerProvider';
import { calculateBoundingRectangle } from './utils';
import type { Mesh } from './utils';

export default class Icon extends React.PureComponent {
  static contextTypes = {
    container: containerShape,
  };

  static defaultProps = {
    x: 0,
    y: 0,
    z: 0,
    name: '',
  };

  props: {
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    name: string,
    color: number,
    mesh: Mesh,
  };

  render() {
    const {
      name,
      width,
      height,
      x,
      y,
      z,
      color,
    } = this.props;

    const { container } = this.context;

    const boundingRectangle = calculateBoundingRectangle(
      container.width,
      container.height,
      width,
      height,
      x,
      y,
    );

    const scale = new THREE.Vector3(boundingRectangle.width / 3.5, boundingRectangle.height / 3.5, 1);

    return (
      <object3D position={new THREE.Vector3(boundingRectangle.left, boundingRectangle.top, 0)} name={name}>
        <mesh renderOrder={z}>
          <planeGeometry
            width={boundingRectangle.width}
            height={boundingRectangle.width}
          />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} opacity={0.8} transparent />
        </mesh>
        <mesh renderOrder={z} scale={scale}>
          <geometry
            vertices={this.props.mesh.vertices}
            faces={this.props.mesh.faces}
            faceVertexUvs={this.props.mesh.faceVertexUvs}
            dynamic
          />
          <meshBasicMaterial color={0xffffff} side={THREE.DoubleSide} transparent />
        </mesh>
      </object3D>
    );
  }
}
