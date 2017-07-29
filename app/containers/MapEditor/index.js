/*
 *
 * MapEditor
 *
 */

import React from 'react';
import { createStructuredSelector } from 'reselect';
import * as THREE from 'three';

import { GridArea, Renderer } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from './Map';

import {
  selectMapDimensions,
  makeSelectMapPalette,
  makeSelectMapTileset,
  makeSelectMapTilemaps,
  makeSelectCameraPosition,
} from './selectors';
import { editMap, commitMapEdit, setCameraPosition } from './actions';

const WIDTH = 512;
const HEIGHT = 512;
const PAN_SPEED = 1;

export class MapEditor extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
    tilemaps: Uint8Array,
    editMap: Function,
    commitMapEdit: Function,
    setCameraPosition: Function,
    dimensions: [number, number],
    camera: {
      x: number,
      y: number,
      z: number,
    },
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
      const panStart = this.state.pan.start;

      const a = new THREE.Vector2(pageX / WIDTH, -pageY / HEIGHT);
      const b = new THREE.Vector2(panStart.x / WIDTH, -panStart.y / HEIGHT);
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
    const { camera } = this.props;
    const x = ((offsetX / WIDTH) * 2) - 1;
    const y = -((offsetY / HEIGHT) * 2) + 1;

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

  render() {
    const { dimensions: [width, height], camera } = this.props;

    return (
      <div onWheel={this.handleWheel}>
        <Renderer
          x={this.state.pan ? this.state.pan.position.x : camera.x}
          y={this.state.pan ? this.state.pan.position.y : camera.y}
          z={camera.z}
          width={WIDTH}
          height={HEIGHT}
          near={0.25}
          far={2}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          cameraRef={(ref) => { this.camera = ref; }}
        >
          <Map
            x={0}
            y={0}
            z={0}
            width={width}
            height={height}
            tileset={this.props.tileset}
            tilemaps={this.props.tilemaps}
            palette={this.props.palette}
          />
          <GridArea
            x={0}
            y={0}
            width={width}
            height={height}
            onMouseMove={this.props.editMap}
            onMouseUp={this.props.commitMapEdit}
            bounded
          />
        </Renderer>
      </div>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: selectMapDimensions(),
  camera: makeSelectCameraPosition(),
  palette: makeSelectMapPalette(),
  tileset: makeSelectMapTileset(),
  tilemaps: makeSelectMapTilemaps(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    editMap(start, end, modifiers) {
      tabDispatch(editMap(start, end, modifiers));
    },
    commitMapEdit() {
      tabDispatch(commitMapEdit());
    },
    setCameraPosition(x, y, z) {
      tabDispatch(setCameraPosition(x, y, z));
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(MapEditor);
