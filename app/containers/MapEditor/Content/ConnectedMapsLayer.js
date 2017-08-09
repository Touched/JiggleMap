import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import DraggableMap from '../DraggableMap';

import {
  makeSelectConnectedMaps,
} from '../selectors';
import {
  moveConnection,
  commitConnectionMove,
} from '../actions';

export class ConnectedMapsLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    moveConnection: (number, number, number) => void,
    commitConnectionMove: (number) => void,
    /* eslint-disable react/no-unused-prop-types */
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
    /* eslint-enable */
  }

  render() {
    const { connections } = this.props;

    return (
      <Group>
        {connections.map(({ dimensions, tilemaps, tileset, palette, position, heightMap, collisionMap }, i) => (
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
            heightMap={heightMap}
            collisionMap={collisionMap}
            onDrag={(start, end) => this.props.moveConnection(i, end.x - start.x, end.y - start.y)}
            onDragEnd={() => this.props.commitConnectionMove(i)}
            darken
          />
        ))}
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  connections: makeSelectConnectedMaps(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    moveConnection(connection, x, y) {
      tabDispatch(moveConnection(connection, x, y));
    },
    commitConnectionMove(connection) {
      tabDispatch(commitConnectionMove(connection));
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(ConnectedMapsLayer);
