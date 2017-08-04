import React from 'react';
import * as THREE from 'three';
import svgMesh3d from 'svg-mesh-3d';
import threeSimplicialComplex from 'three-simplicial-complex';

import { containerShape } from './ContainerProvider';
import { calculateBoundingRectangle } from './utils';

const Complex = threeSimplicialComplex(THREE);

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

  componentWillMount() {
    this.update(this.props);
  }

  componentWillUpdate(nextProps) {
    this.update(nextProps);
  }

  props: {
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    name: string,
    path: string, // eslint-disable-line react/no-unused-prop-types
    color: number,
  };

  update({ path }) {
    const complex = svgMesh3d(path);
    this.mesh = new Complex(complex);
  }

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
            vertices={this.mesh.vertices}
            faces={this.mesh.faces}
            faceVertexUvs={this.mesh.faceVertexUvs}
            dynamic
          />
          <meshBasicMaterial color={0xffffff} side={THREE.DoubleSide} transparent />
        </mesh>
      </object3D>
    );
  }
}
