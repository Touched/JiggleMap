/*
 *
 * MapEditor
 *
 */

import React from 'react';
import { createStructuredSelector } from 'reselect';
import * as THREE from 'three';
import { withContentRect } from 'react-measure';

import { GridArea, Renderer } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from './Map';
import DraggableMap from './DraggableMap';
import './styles.scss';

import {
  selectMapDimensions,
  makeSelectMapPalette,
  makeSelectMapTileset,
  makeSelectMapTilemaps,
  makeSelectCameraPosition,
  makeSelectConnectedMaps,
} from './selectors';
import {
  editMap,
  commitMapEdit,
  setCameraPosition,
  moveConnection,
  commitConnectionMove,
  resizeViewport,
} from './actions';

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
    tilemaps: Array<Uint8Array>,
    editMap: Function,
    commitMapEdit: Function,
    setCameraPosition: Function,
    measureRef: Function,
    moveConnection: (number, number, number) => void,
    commitConnectionMove: (number) => void,
    dimensions: [number, number],
    camera: {
      x: number,
      y: number,
      z: number,
    },
    connections: {
      palette: Uint8Array,
      tileset: Uint8Array,
      tilemaps: Array<Uint8Array>,
      dimensions: [number, number],
      position: {
        x: number,
        y: number,
      },
    },
    contentRect: {
      bounds: {
        width: number, // eslint-disable-line react/no-unused-prop-types
        height: number, // eslint-disable-line react/no-unused-prop-types
      },
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

  render() {
    const { dimensions: [width, height], camera, connections, measureRef, contentRect } = this.props;

    return (
      <div onWheel={this.handleWheel} ref={measureRef} className="MapEditor">
        <Renderer
          x={this.state.pan ? this.state.pan.position.x : camera.x}
          y={this.state.pan ? this.state.pan.position.y : camera.y}
          z={camera.z}
          width={contentRect.bounds.width}
          height={contentRect.bounds.height}
          near={0.25}
          far={2}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          cameraRef={(ref) => { this.camera = ref; }}
          className="MapEditor__MapViewport"
        >
          {connections.map(({ dimensions, tilemaps, tileset, palette, position }, i) => (
            <DraggableMap
              key={i} // eslint-disable-line react/no-array-index-key
              x={position.x}
              y={position.y}
              z={0}
              width={dimensions[0]}
              height={dimensions[1]}
              tileset={tileset}
              tilemaps={tilemaps}
              palette={palette}
              onDrag={(start, end) => this.props.moveConnection(i, end.x - start.x, end.y - start.y)}
              onDragEnd={() => this.props.commitConnectionMove(i)}
              darken
            />
          ))}
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
  connections: makeSelectConnectedMaps(),
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
    moveConnection(connection, x, y) {
      tabDispatch(moveConnection(connection, x, y));
    },
    commitConnectionMove(connection) {
      tabDispatch(commitConnectionMove(connection));
    },
    onResize({ bounds: { width, height } }) {
      tabDispatch(resizeViewport(width, height));
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(withContentRect('bounds')(MapEditor));
