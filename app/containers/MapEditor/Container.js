import React from 'react';

import { createStructuredSelector } from 'reselect';
import * as THREE from 'three';
import { withContentRect } from 'react-measure';

import { Renderer } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';
import { calculateBoundingRectangle } from 'components/Renderer/utils';

import MapControls from './MapControls';
import ToolBox from './ToolBox';
import './styles.scss';
import type { Tool, Dispatch } from './tools/types';

import {
  makeSelectMainMapDimensions,
  makeSelectCameraPosition,
  makeSelectToolState,
  makeSelectActiveLayer,
  makeSelectActiveTool,
} from './selectors';
import {
  setCameraPosition,
  resizeViewport,
  setActiveLayer,
} from './actions';

const PAN_SPEED = 1;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;

export class Container extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      pan: null,
    };
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  props: {
    setCameraPosition: Function,
    setActiveLayer: Function,
    tabDispatch: Dispatch,
    measureRef: Function,
    dimensions: [number, number],
    activeLayer: string,
    camera: {
      x: number,
      y: number,
      z: number,
    },
    contentRect: {
      bounds: {
        width: number, // eslint-disable-line react/no-unused-prop-types
        height: number, // eslint-disable-line react/no-unused-prop-types
      },
    },
    children: React.Element,
    activeTool: Tool<Object>,
    toolState: Object,
  }

  camera: THREE.Camera;

  handleMouseDown = (event: { nativeEvent: MouseEvent } & SyntheticMouseEvent) => {
    if (event.buttons & 4) { // eslint-disable-line no-bitwise
      event.preventDefault();
      const { pageX: x, pageY: y } = event;

      this.setState((state) => ({
        ...state,
        pan: {
          start: { x, y },
          position: {
            x: this.props.camera.x,
            y: this.props.camera.y,
          },
        },
      }));
    }
  };

  handleMouseMove = (event: { nativeEvent: MouseEvent } & SyntheticMouseEvent) => {
    if (this.state.pan) {
      event.preventDefault();

      const { pageX, pageY } = event;
      const { contentRect: { bounds } } = this.props;
      const panStart = this.state.pan.start;

      const a = new THREE.Vector2(pageX / bounds.width, -pageY / bounds.height);
      const b = new THREE.Vector2(panStart.x / bounds.width, -panStart.y / bounds.height);
      const mouseChange = new THREE.Vector2().subVectors(a, b);
      const eye = new THREE.Vector3(0, 0, 0).sub(this.camera.position);

      mouseChange.multiplyScalar(eye.length() * PAN_SPEED);

      const pan = new THREE.Vector3();
      pan.copy(eye).cross(this.camera.up).setLength(mouseChange.x);
      pan.add(this.camera.up.clone().setLength(mouseChange.y));

      const { x, y } = this.state.pan.position;

      this.setState((state) => ({
        ...state,
        pan: {
          start: {
            x: pageX,
            y: pageY,
          },
          position: {
            x: x + pan.x,
            y: y + pan.y,
          },
        },
      }));
    } else if (this.props.activeTool) {
      this.props.activeTool.onMouseMove(this.props.toolState, this.props.tabDispatch, event);
    }
  };

  handleMouseUp = () => {
    if (this.state.pan) {
      this.props.setCameraPosition(this.state.pan.position.x, this.state.pan.position.y, this.props.camera.z);

      this.setState((state) => ({
        ...state,
        pan: null,
      }));
    } else if (this.props.activeTool) {
      this.props.activeTool.onMouseUp(this.props.toolState, this.props.tabDispatch, event);
    }
  };

  handleWheel = ({ deltaY, nativeEvent: { offsetX, offsetY } }) => {
    const { camera, contentRect: { bounds } } = this.props;
    const x = ((offsetX / bounds.width) * 2) - 1;
    const y = -((offsetY / bounds.height) * 2) + 1;

    const vector = new THREE.Vector3(x, y, 1);
    const currentPosition = new THREE.Vector3(camera.x, camera.y, camera.z);

    vector.unproject(this.camera);
    vector.sub(currentPosition);

    if (deltaY < 0) {
      vector.subVectors(currentPosition, vector.setLength(0.25));
    } else {
      vector.addVectors(currentPosition, vector.setLength(0.25));
    }

    if (vector.z > ZOOM_MIN && vector.z < ZOOM_MAX) {
      this.props.setCameraPosition(vector.x, vector.y, vector.z);
    }
  };

  recenterMap = () => {
    const { contentRect: { bounds: { width, height } }, dimensions, camera } = this.props;
    const boundingBox = calculateBoundingRectangle(width, height, dimensions[0] * 16, dimensions[1] * 16, 0, 0);
    const min = new THREE.Vector3(0, 0, 0);
    const max = new THREE.Vector3(boundingBox.width, boundingBox.height, 0);
    const box = new THREE.Box3(min, max);
    const midpoint = box.getCenter();

    this.props.setCameraPosition(midpoint.x, -midpoint.y, camera.z);
  };

  render() {
    const { camera, measureRef, contentRect } = this.props;

    return (
      <div className="MapEditor">
        <div className="MapEditor__Container" ref={measureRef} onWheel={this.handleWheel}>
          <div className="MapEditor__Overlay">
            <ToolBox tabDispatch={this.props.tabDispatch} />
            <MapControls
              zoomMin={ZOOM_MIN}
              zoomMax={ZOOM_MAX}
              zoom={camera.z}
              onToggleLayer={this.props.setActiveLayer}
              onRecenterClick={this.recenterMap}
              activeLayer={this.props.activeLayer}
              onZoomChanged={({ target }) => this.props.setCameraPosition(camera.x, camera.y, target.value)}
            />
          </div>
          <div // eslint-disable-line jsx-a11y/no-static-element-interactions
            onMouseDown={this.handleMouseDown}
          >
            <Renderer
              x={this.state.pan ? this.state.pan.position.x : camera.x}
              y={this.state.pan ? this.state.pan.position.y : camera.y}
              zoom={camera.z}
              width={contentRect.bounds.width}
              height={contentRect.bounds.height}
              zoomMin={ZOOM_MIN}
              zoomMax={ZOOM_MAX}
              onMouseMove={this.handleMouseMove}
              onMouseUp={this.handleMouseUp}
              cameraRef={(ref) => { this.camera = ref; }}
              className="MapEditor__MapViewport"
            >
              {React.Children.only(this.props.children)}
            </Renderer>
          </div>
        </div>
        <div className="ToolControls">
          {this.props.activeTool && this.props.activeTool.component && (
          <this.props.activeTool.component
            tabDispatch={this.props.tabDispatch}
            state={this.props.toolState}
          />)}
        </div>
      </div>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: makeSelectMainMapDimensions(),
  camera: makeSelectCameraPosition(),
  toolState: makeSelectToolState(),
  activeLayer: makeSelectActiveLayer(),
  activeTool: makeSelectActiveTool(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    setCameraPosition(x, y, z) {
      tabDispatch(setCameraPosition(x, y, z));
    },
    onResize({ bounds: { width, height } }) {
      tabDispatch(resizeViewport(width, height));
    },
    setActiveLayer(layer) {
      tabDispatch(setActiveLayer(layer));
    },
    tabDispatch,
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(withContentRect('bounds')(Container));
