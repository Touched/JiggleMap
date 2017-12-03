import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import ConnectedMap from './ConnectedMap';
import { makeSelectConnectedMaps, makeSelectConnectedMapObjects } from '../selectors/mapSelectors';
import { makeSelectActiveLayer } from '../selectors/editingSelectors';

import {
  moveConnection,
  commitConnectionMove,
} from '../actions';

export class ConnectedMapsLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    moveConnection: (number, number, number) => void,
    commitConnectionMove: (number) => void,
    activeLayer: string,
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
    objects: [Object],
  }

  render() {
    const { connections, activeLayer, objects } = this.props;

    return (
      <Group>
        {connections.map(({ map, blocksets, position, showHeightMap, showCollisionMap }, i) => (
          <ConnectedMap
            key={i} // eslint-disable-line react/no-array-index-key
            x={position.x}
            y={position.y}
            z={0}
            width={map.dimensions[0]}
            height={map.dimensions[1]}
            blocksets={blocksets}
            map={map}
            showHeightMap={activeLayer === 'height'}
            showCollisionMap={activeLayer === 'collision'}
            onDrag={(start, end) => this.props.moveConnection(i, end.x - start.x, end.y - start.y)}
            onDragEnd={() => this.props.commitConnectionMove(i)}
            object={{ ...objects[i], id: i }}
            darken
          />
        ))}
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  connections: makeSelectConnectedMaps(),
  activeLayer: makeSelectActiveLayer(),
  objects: makeSelectConnectedMapObjects(),
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
