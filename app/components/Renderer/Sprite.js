import React from 'react';
import * as THREE from 'three';

import { containerShape } from './ContainerProvider';
import { calculateBoundingRectangle } from './utils';

export default class Sprite extends React.Component {
  static contextTypes = {
    container: containerShape,
  };

  static defaultProps = {
    x: 0,
    y: 0,
    z: 0,
    name: '',
  };

  componentDidMount() {
    this.updateData();
  }

  componentDidUpdate() {
    this.updateData();
  }

  props: {
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    name: string,
    url: string,
  };

  updateData() {
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
  }

  render() {
    const {
      name,
      width,
      height,
      x,
      y,
      z,
      url,
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

    return (
      <object3D position={new THREE.Vector3(boundingRectangle.left, boundingRectangle.top, 0)} name={name}>
        <sprite renderOrder={z} scale={new THREE.Vector3(boundingRectangle.width, boundingRectangle.height, 1)}>
          <spriteMaterial>
            <texture
              url={url}
              crossOrigin="anonymous"
              minFilter={THREE.NearestFilter}
              magFilter={THREE.NearestFilter}
              ref={(ref) => { this.texture = ref; }}
            />
          </spriteMaterial>
        </sprite>
      </object3D>
    );
  }
}
