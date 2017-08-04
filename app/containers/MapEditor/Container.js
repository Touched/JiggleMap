import React from 'react';

import { createStructuredSelector } from 'reselect';
import * as THREE from 'three';
import { withContentRect } from 'react-measure';

import { Renderer } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';
import { calculateBoundingRectangle } from 'components/Renderer/utils';

import MapControls from './MapControls';
import ToolBox from './ToolBox';
import BlockPicker from './BlockPicker';
import './styles.scss';

import {
  makeSelectMainMapDimensions,
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectCameraPosition,
  makeSelectMainMapBlockset,
  makeSelectToolState,
} from './selectors';
import {
  setCameraPosition,
  resizeViewport,
  setCurrentBlock,
} from './actions';

const PAN_SPEED = 1;

export class Container extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      pan: null,
    };
  }

  camera: THREE.Camera;
  props: {
    palette: Uint8Array,
    tileset: Uint8Array,
    blocks: Array<Uint8Array>,
    setCameraPosition: Function,
    setCurrentBlock: Function,
    tabDispatch: Function,
    measureRef: Function,
    dimensions: [number, number],
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
  }

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
    }
  };

  handleMouseUp = () => {
    if (this.state.pan) {
      this.props.setCameraPosition(this.state.pan.position.x, this.state.pan.position.y, this.props.camera.z);

      this.setState((state) => ({
        ...state,
        pan: null,
      }));
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
      vector.addVectors(currentPosition, vector.setLength(0.25));
    } else {
      vector.subVectors(currentPosition, vector.setLength(0.25));
    }

    if (vector.z > this.camera.near && vector.z < this.camera.far) {
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

    const near = 0.25;
    const far = 2;

    return (
      <div className="MapEditor">
        <div className="MapEditor__Container" ref={measureRef} onWheel={this.handleWheel}>
          <div className="MapEditor__Overlay">
            <ToolBox tabDispatch={this.props.tabDispatch} />
            <MapControls
              zoomMin={near}
              zoomMax={far}
              zoom={camera.z}
              onToggleLayer={console.log}
              onRecenterClick={this.recenterMap}
              onZoomChanged={({ target }) => this.props.setCameraPosition(camera.x, camera.y, target.value)}
              selectedLayer="map"
            />
          </div>
          <Renderer
            x={this.state.pan ? this.state.pan.position.x : camera.x}
            y={this.state.pan ? this.state.pan.position.y : camera.y}
            z={camera.z}
            width={contentRect.bounds.width}
            height={contentRect.bounds.height}
            near={near}
            far={far}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
            cameraRef={(ref) => { this.camera = ref; }}
            className="MapEditor__MapViewport"
          >
            {React.Children.only(this.props.children)}
          </Renderer>
        </div>
        <div className="ToolControls">
          <BlockPicker
            tileset={this.props.tileset}
            palette={this.props.palette}
            blocks={this.props.blocks}
            onChange={this.props.setCurrentBlock}
          />
        </div>
      </div>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: makeSelectMainMapDimensions(),
  camera: makeSelectCameraPosition(),
  palette: makeSelectMainMapPalette(),
  tileset: makeSelectMainMapTileset(),
  tilemaps: makeSelectMainMapTilemaps(),
  blocks: makeSelectMainMapBlockset(),
  toolState: makeSelectToolState(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    setCameraPosition(x, y, z) {
      tabDispatch(setCameraPosition(x, y, z));
    },
    onResize({ bounds: { width, height } }) {
      tabDispatch(resizeViewport(width, height));
    },
    setCurrentBlock(block) {
      tabDispatch(setCurrentBlock(block));
    },
    tabDispatch,
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(withContentRect('bounds')(Container));
