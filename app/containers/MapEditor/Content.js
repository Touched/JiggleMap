import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group, GridArea } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from './Map';
import MapEntities from './MapEntities';
import DraggableMap from './DraggableMap';

import {
  makeSelectMainMapDimensions,
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectConnectedMaps,
  makeSelectToolState,
  makeSelectMainMapEntities,
} from './selectors';
import {
  editMap,
  commitMapEdit,
  moveConnection,
  commitConnectionMove,
} from './actions';

export class Content extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    palette: Uint8Array,
    tileset: Uint8Array,
    tilemaps: Array<Uint8Array>,
    editMap: Function,
    commitMapEdit: Function,
    moveConnection: (number, number, number) => void,
    commitConnectionMove: (number) => void,
    dimensions: [number, number],
    toolState: Object,
    connections: {
      palette: Uint8Array,
      tileset: Uint8Array,
      tilemaps: Array<Uint8Array>,
      dimensions: [number, number],
      position: {
        x: number, // eslint-disable-line react/no-unused-prop-types
        y: number, // eslint-disable-line react/no-unused-prop-types
      },
    },
    contentRect: {
      bounds: {
        width: number, // eslint-disable-line react/no-unused-prop-types
        height: number, // eslint-disable-line react/no-unused-prop-types
      },
    },
    entities: Array<Entity>,
  }

  render() {
    const { dimensions: [width, height], connections } = this.props;

    return (
      <Group>
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
          onMouseMove={(...args) => this.props.editMap(this.props.toolState, ...args)}
          onMouseUp={this.props.commitMapEdit}
          bounded
        />
        <MapEntities entities={this.props.entities} />
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: makeSelectMainMapDimensions(),
  palette: makeSelectMainMapPalette(),
  tileset: makeSelectMainMapTileset(),
  tilemaps: makeSelectMainMapTilemaps(),
  connections: makeSelectConnectedMaps(),
  toolState: makeSelectToolState(),
  entities: makeSelectMainMapEntities(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    editMap(toolState, start, end, modifiers) {
      tabDispatch(editMap(toolState, start, end, modifiers));
    },
    commitMapEdit() {
      tabDispatch(commitMapEdit());
    },
    moveConnection(connection, x, y) {
      tabDispatch(moveConnection(connection, x, y));
    },
    commitConnectionMove(connection) {
      tabDispatch(commitConnectionMove(connection));
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(Content);
