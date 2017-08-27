/* @flow */

import React from 'react';
import React3 from 'react-three-renderer';
import { CSS3DRenderer } from 'three-renderer-css3d';
import * as THREE from 'three';

import ContainerProvider from './ContainerProvider';
import { FOV, FOV_RADIANS, DISTANCE } from './constants';

type Props = {
  x: number,
  y: number,
  zoom: number,
  width: number,
  height: number,
  zoomMin: number,
  zoomMax: number,
  customRenderer: Function,
  children: React$Component<*, *, *>,
  cameraRef: (THREE.Camera) => void,
  canvasRef: (HTMLCanvasElement) => void,
  onMouseDown: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseMove: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseUp: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  className: string,
};

type DefaultProps = {
  onMouseDown: ?(Event) => void,
  onMouseMove: ?(Event) => void,
  onMouseUp: ?(Event) => void,
  cameraRef: ?(THREE.Camera) => void,
  canvasRef: ?(HTMLCanvasElement) => void,
  customRenderer: ?Function,
};

type State = {
  cursor: ?string,
};

const propsEvents = {
  mousedown: 'onMouseDown',
  mousemove: 'onMouseMove',
  mouseup: 'onMouseUp',
};

const isGlobalEvent = {
  mousedown: false,
  mousemove: true,
  mouseup: true,
};

function getAllChildren({ children }) {
  return children.concat(...children.map(getAllChildren));
}

export default class Renderer extends React.PureComponent<DefaultProps, Props, State> {
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

  constructor(props: Props) {
    super(props);
    this.raycaster = new THREE.Raycaster();
    this.state = {
      cursor: null,
    };

    this.redispatchMouseEvent = this.redispatchMouseEvent.bind(this);
  }

  state: State;

  componentDidMount() {
    window.addEventListener('mouseup', this.redispatchMouseEvent);
    window.addEventListener('mousemove', this.redispatchMouseEvent);
  }

  componentDidUpdate() {
    this.cssRenderer.setSize(this.props.width, this.props.height);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.redispatchMouseEvent);
    window.removeEventListener('mousemove', this.redispatchMouseEvent);
  }

  onUpdateRenderer = (renderer: THREE.WebGLRenderer) => {
    // Monkey-patch renderer
    const { render } = renderer;
    this.cssRenderer = new CSS3DRenderer();

    renderer.render = (scene: THREE.Scene, camera: THREE.Camera) => { // eslint-disable-line no-param-reassign
      render.call(renderer, scene, camera);
      this.cssRenderer.render(scene, camera);
    };

    this.cssRendererContainer.appendChild(this.cssRenderer.domElement);
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

  handleClick = this.redispatchMouseEvent.bind(this);
  handleMouseDown = this.redispatchMouseEvent.bind(this);

  redispatchMouseEvent(event: { type: string, nativeEvent: MouseEvent } & SyntheticEvent) {
    const rendererEvent = this.props[propsEvents[event.type]];
    const nativeEvent = event.nativeEvent || event;

    if (!event.nativeEvent) {
      const wrapped = event.stopPropagation;
      let propagationStopped = false;

      // $FlowFixMe
      event.stopPropagation = () => { // eslint-disable-line no-param-reassign
        propagationStopped = true;
        wrapped();
      };

      // $FlowFixMe
      event.isPropagationStopped = () => propagationStopped; // eslint-disable-line no-param-reassign
    }

    if (rendererEvent) {
      rendererEvent(event);

      if (event.defaultPrevented || (event.isDefaultPrevented && event.isDefaultPrevented())) {
        return;
      }
    }

    const { offsetX, offsetY } = nativeEvent;
    const { width, height } = this.props;
    const x = offsetX / width;
    const y = offsetY / height;

    // Calculate the world coordinates from mouse position
    const dir = new THREE.Vector3((x * 2) - 1, -(y * 2) + 1, 0)
      .unproject(this.camera)
      .sub(this.camera.position)
      .normalize();
    const distance = -this.camera.position.z / dir.z;
    const cursorPosition = this.camera.position.clone().add(dir.multiplyScalar(distance));

    const coords = new THREE.Vector2((x * 2) - 1, -(y * 2) + 1);
    this.raycaster.setFromCamera(coords, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true).map(
      (intersect) => intersect.object,
    );

    const objects = isGlobalEvent[event.type] ? getAllChildren(this.scene) : intersects;

    objects.reverse().every((object) => {
      const aspect = width / height;
      const verticalFraction = 2 * Math.tan(FOV_RADIANS / 2) * DISTANCE;
      const horizontalFraction = verticalFraction * aspect;
      const pixelX = Math.floor((cursorPosition.x * width) / horizontalFraction);
      const pixelY = Math.floor((-cursorPosition.y * height) / verticalFraction);

      const { dispatchHitRegionMouseEvent: dispatchEvent } = object.userData;

      if (dispatchEvent) {
        const areaEvent = dispatchEvent(event.type, event, { x: pixelX, y: pixelY });
        return !areaEvent.isPropagationStopped();
      }

      return true;
    });

    if (intersects.length) {
      const cursor = intersects.reduce((currentCursor, object) => {
        const { getCursor } = object.userData;

        if (getCursor) {
          return getCursor(event.type);
        }

        return null;
      });

      if (cursor !== this.state.cursor) {
        this.setState(() => ({ cursor }));
      }
    } else if (this.state.cursor !== null) {
      this.setState(() => ({ cursor: null }));
    }
  }

  props: Props;
  raycaster: THREE.Raycaster;
  scene: THREE.Scene;
  camera: THREE.Camera;
  cssRendererContainer: HTMLElement;
  cssRenderer: CSS3DRenderer;

  render() {
    const { x, y, zoom, width, height, zoomMin, zoomMax, children } = this.props;

    const cursor = this.state.cursor || 'default';

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
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        className={this.props.className}
        style={{ cursor, position: 'relative' }}
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
