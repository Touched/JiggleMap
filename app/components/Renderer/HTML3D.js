/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import { CSS3DObject } from 'three-renderer-css3d';
import * as THREE from 'three';

import { containerShape } from './ContainerProvider';
import { calculateBoundingRectangle } from './utils';

export default class HTML3D extends React.PureComponent<*, *, *> {
  static contextTypes = {
    container: containerShape,
  };

  static defaultProps = {
    name: '',
    x: 0,
    y: 0,
    z: Infinity,
  };

  componentDidMount() {
    this.element = document.createElement('div');
    ReactDOM.render(this.props.children, this.element);
    const object = new CSS3DObject(this.element);
    this.group.add(object);
  }

  props: {
    name: string,
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    children: React.Children,
  };
  group: THREE.Group;
  element: HTMLElement;

  render() {
    const { name, width, height, x, y, z } = this.props;
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
      <group
        name={name}
        renderOrder={z}
        position={new THREE.Vector3(boundingRectangle.left, boundingRectangle.top, 0)}
        ref={(ref) => { this.group = ref; }}
      />
    );
  }
}
