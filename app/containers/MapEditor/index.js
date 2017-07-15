/*
 *
 * MapEditor
 *
 */

import React from 'react';
import { createStructuredSelector } from 'reselect';
import * as THREE from 'three';

import { GridArea, GBATilemap, Renderer } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import {
  selectMapDimensions,
  makeSelectMapPalette,
  makeSelectMapTileset,
  makeSelectMapTilemap,
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
    tilemap: Uint8Array,
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
      this.props.setCameraPosition(this.state.pan.position.x, this.state.pan.position.y);

      this.setState((state) => ({
        ...state,
        pan: null,
      }));
    }
  };

  render() {
    const { dimensions: [width, height], camera } = this.props;

    return (
      <div>
        <Renderer
          x={this.state.pan ? this.state.pan.position.x : camera.x}
          y={this.state.pan ? this.state.pan.position.y : camera.y}
          z={this.props.camera.z}
          width={WIDTH}
          height={HEIGHT}
          near={0.25}
          far={2}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          cameraRef={(ref) => { this.camera = ref; }}
        >
          <GBATilemap
            x={0}
            y={0}
            z={0}
            width={width * 16}
            height={height * 16}
            tileset={this.props.tileset}
            tilemap={this.props.tilemap[0]}
            palette={this.props.palette}
            transparent
          />
          <GBATilemap
            x={0}
            y={0}
            z={0}
            width={width * 16}
            height={height * 16}
            tileset={this.props.tileset}
            tilemap={this.props.tilemap[1]}
            palette={this.props.palette}
            transparent
          />
          <GridArea
            x={0}
            y={0}
            width={width * 16}
            height={height * 16}
            onMouseMove={this.props.editMap}
            onMouseUp={this.props.commitMapEdit}
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
  tilemap: makeSelectMapTilemap(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    editMap(start, end, modifiers) {
      tabDispatch(editMap(start, end, modifiers));
    },
    commitMapEdit() {
      tabDispatch(commitMapEdit());
    },
    setCameraPosition(x, y) {
      tabDispatch(setCameraPosition(x, y));
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(MapEditor);
