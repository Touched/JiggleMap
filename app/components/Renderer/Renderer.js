/* @flow */

import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';

import ContainerProvider from './ContainerProvider';
import { FOV } from './constants';

type RendererProps = {
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  near: number,
  far: number,
  children: React$Component<*, *, *>,
};

export default class Renderer extends React.PureComponent {
  constructor(props: RendererProps) {
    super(props);
    this.raycaster = new THREE.Raycaster();
  }

  props: RendererProps;
  raycaster: THREE.Raycaster;
  scene: THREE.Scene;
  camera: THREE.Camera;

  handleClick = this.redispatchMouseEvent.bind(this);
  handleMouseMove = this.redispatchMouseEvent.bind(this);
  handleMouseUp = this.redispatchMouseEvent.bind(this);
  handleMouseDown = this.redispatchMouseEvent.bind(this);

  redispatchMouseEvent(event: { type: string, nativeEvent: MouseEvent }) {
    const { offsetX, offsetY } = event.nativeEvent;
    const { width, height } = this.props;

    const x = offsetX / width;
    const y = offsetY / height;
    const coords = new THREE.Vector2((x * 2) - 1, -(y * 2) + 1);

    this.raycaster.setFromCamera(coords, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    intersects.every((details) => {
      const { dispatchHitRegionMouseEvent: dispatchEvent } = details.object.userData;

      if (dispatchEvent) {
        const areaEvent = dispatchEvent(event.type, event, details);
        return !areaEvent.isPropagationStopped();
      }

      return true;
    });
  }

  render() {
    const { x, y, z, width, height, near, far, children } = this.props;

    return (
      <div
        role="button"
        tabIndex="0"
        onClick={this.handleClick}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseDown={this.handleMouseDown}
      >
        <React3
          mainCamera="camera"
          width={width}
          height={height}
          pixelRatio={window.devicePixelRatio}
          alpha
        >
          <scene ref={(ref) => { this.scene = ref; }}>
            <perspectiveCamera
              name="camera"
              fov={FOV}
              aspect={width / height}
              near={near - 0.0001}
              far={far}
              position={new THREE.Vector3(x, y, z)}
              ref={(ref) => { this.camera = ref; }}
            />
            <ContainerProvider container={{ width, height }}>
              {children}
            </ContainerProvider>
          </scene>
        </React3>
      </div>
    );
  }
}
