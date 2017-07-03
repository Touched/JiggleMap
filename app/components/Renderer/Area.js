/* @flow */

import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import nop from 'utils/nop';

import { containerShape } from './ContainerProvider';
import { calculateBoundingRectangle } from './utils';

export type RaycastDetails = {
  distance: number,
  face: THREE.Face3,
  faceIndex: number,
  object: THREE.Object3D,
  point: THREE.Vector3,
  uv: THREE.Vector2,
};

type Dimensions = {
  width: number,
  height: number,
};

export class AreaEvent {
  x: number;
  y: number;
  propagationStopped: boolean;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  button: number;
  buttons: number;

  constructor(baseEvent: MouseEvent, dimensions: Dimensions, details: RaycastDetails) {
    this.x = dimensions.width * details.uv.x;
    this.y = dimensions.height * (1 - details.uv.y);
    this.shiftKey = baseEvent.shiftKey;
    this.altKey = baseEvent.altKey;
    this.ctrlKey = baseEvent.ctrlKey;
    this.metaKey = baseEvent.metaKey;
    this.button = baseEvent.button;
    this.buttons = baseEvent.buttons;
    this.propagationStopped = false;
  }

  isPropagationStopped() {
    return this.propagationStopped;
  }

  stopPropagation() {
    this.propagationStopped = true;
  }
}

type EventCallback = (AreaEvent) => void;

/**
 * A hit region that recieves events used to provide interactive capabilities to rendered layers
 */
export default class Area extends React.PureComponent {
  static contextTypes = {
    container: containerShape,
  };

  static defaultProps = {
    x: 0,
    y: 0,
    z: Infinity,
    name: '',
    onClick: nop,
    onMouseDown: nop,
    onMouseMove: nop,
    onMouseUp: nop,
  };

  componentDidMount() {
    const object = React3.findTHREEObject(this);
    object.userData.dispatchHitRegionMouseEvent = this.dispatchHitRegionMouseEvent.bind(this);
  }

  props: {
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    name: string,
    onClick: EventCallback,
    onMouseDown: EventCallback,
    onMouseUp: EventCallback,
    onMouseMove: EventCallback,
  };

  dispatchHitRegionMouseEvent(type: string, event: MouseEvent, details: RaycastDetails) {
    const { width, height } = this.props;
    const areaEvent = new AreaEvent(event, { width, height }, details);

    this.dispatchEvent(type, areaEvent);

    return event;
  }

  fetchHandler = {
    click: this.props.onClick,
    mousedown: this.props.onMouseDown,
    mouseup: this.props.onMouseUp,
    mousemove: this.props.onMouseMove,
  };

  dispatchEvent(type: string, event: AreaEvent) {
    const handler = this.fetchHandler[type];

    if (handler) {
      handler(event);
    }
  }

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
      <mesh
        name={name}
        renderOrder={z}
        position={new THREE.Vector3(boundingRectangle.left, boundingRectangle.top, 0)}
      >
        <planeGeometry width={boundingRectangle.width} height={boundingRectangle.height} />
        <meshBasicMaterial visible={false} />
      </mesh>
    );
  }
}
