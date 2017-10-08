/* @flow */

import * as React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';

import { CSS3DRenderer } from './css3dRenderer';
import ContainerProvider from './ContainerProvider';
import { FOV, FOV_RADIANS } from './constants';

type Props = {
  x: number,
  y: number,
  zoom: number,
  width: number,
  height: number,
  zoomMin: number,
  zoomMax: number,
  customRenderer: Function,
  children: React.Node,
  cameraRef: (THREE.Camera) => void,
  canvasRef: (HTMLCanvasElement) => void,
  onMouseDown: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseMove: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseUp: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  className: string,
};

export default class Renderer extends React.PureComponent<Props, *> {
  static defaultProps = {
    onMouseDown: null,
    onMouseMove: null,
    onMouseUp: null,
    cameraRef: null,
    canvasRef: null,
    customRenderer: null,
    zoom: 1,
    zoomMin: 1,
    zoomMax: 1,
  };

  static contextTypes = {
    tabId: React.PropTypes.string,
    store: React.PropTypes.object,
  };

  componentDidUpdate() {
    this.cssRenderer.setSize(this.props.width, this.props.height);
  }

  onUpdateRenderer = (renderer: ?THREE.WebGLRenderer) => {
    if (!renderer) {
      return;
    }

    // Monkey-patch renderer
    const { render } = renderer;
    this.cssRenderer = new CSS3DRenderer();

    renderer.render = (scene: THREE.Scene, camera: THREE.Camera) => { // eslint-disable-line no-param-reassign
      render.call(renderer, scene, camera);
      this.cssRenderer.render(scene, camera);
    };

    if (this.cssRendererContainer) {
      this.cssRendererContainer.appendChild(this.cssRenderer.domElement);
    }

    this.cssRenderer.domElement.style.position = 'absolute';
    this.cssRenderer.domElement.style.top = '0';
    this.cssRenderer.setSize(this.props.width, this.props.height);
  };

  setCameraRef = (ref: THREE.Camera) => {
    this.camera = ref;
    if (this.props.cameraRef) {
      this.props.cameraRef(ref);
    }
  };

  props: Props;
  raycaster: THREE.Raycaster;
  scene: THREE.Scene;
  camera: THREE.Camera;
  cssRendererContainer: ?HTMLElement;
  cssRenderer: CSS3DRenderer;

  render() {
    const { x, y, zoom, width, height, zoomMin, zoomMax, children } = this.props;

    // Calculate z coordinate for the camera such that the 3D world coordinates
    // are 1:1 with DOM pixel coordinates.
    const distance = height / (2 * Math.tan(FOV_RADIANS / 2));
    const z = distance * Math.min(Math.max(zoomMin, 1 / zoom), zoomMax);

    // Near/far must be smaller/greater than z (respectively)
    const near = distance * zoomMin * 0.9;
    const far = distance * zoomMax * 1.1;

    return (
      <div
        role="button"
        tabIndex="0"
        className={this.props.className}
        style={{ position: 'relative' }}
      >
        <div ref={(ref) => { this.cssRendererContainer = ref; }} />
        <React3
          mainCamera="camera"
          canvasRef={(ref) => this.props.canvasRef && this.props.canvasRef(ref)}
          customRenderer={this.props.customRenderer}
          onRendererUpdated={this.onUpdateRenderer}
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
              near={near}
              far={far}
              position={new THREE.Vector3(x, y, z)}
              ref={this.setCameraRef}
            />
            <ContainerProvider
              container={{ width, height }}
              store={this.context.store}
              tabId={this.context.tabId}
            >
              {children}
            </ContainerProvider>
          </scene>
        </React3>
      </div>
    );
  }
}
