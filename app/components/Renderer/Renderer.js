/* @flow */

import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';

import ContainerProvider from './ContainerProvider';
import { FOV, FOV_RADIANS, DISTANCE } from './constants';

type RendererProps = {
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  near: number,
  far: number,
  customRenderer: Function,
  children: React$Component<*, *, *>,
  cameraRef: (THREE.Camera) => void,
  canvasRef: (HTMLCanvasElement) => void,
  onMouseDown: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseMove: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseUp: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  className: string,
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

export default class Renderer extends React.PureComponent {
  static defaultProps: {
    onMouseDown: null,
    onMouseMove: null,
    onMouseUp: null,
    cameraRef: null,
    canvasRef: null,
    customRenderer: null,
  }

  static contextTypes = {
    tabId: React.PropTypes.string,
    store: React.PropTypes.object,
  };

  constructor(props: RendererProps) {
    super(props);
    this.raycaster = new THREE.Raycaster();
    this.state = {
      cursor: null,
    };
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.redispatchMouseEvent.bind(this));
    window.addEventListener('mousemove', this.redispatchMouseEvent.bind(this));
  }

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

  props: RendererProps;
  raycaster: THREE.Raycaster;
  scene: THREE.Scene;
  camera: THREE.Camera;

  render() {
    const { x, y, z, width, height, near, far, children } = this.props;

    const cursor = this.state.cursor || 'default';

    return (
      <div
        role="button"
        tabIndex="0"
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        className={this.props.className}
        style={{ cursor }}
      >
        <React3
          mainCamera="camera"
          canvasRef={(ref) => this.props.canvasRef && this.props.canvasRef(ref)}
          customRenderer={this.props.customRenderer}
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
