import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Colormap, Group, GridArea } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from '../Map';

import {
  makeSelectMainMapDimensions,
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectMainMapCollisionMap,
  makeSelectMainMapHeightMap,
  makeSelectToolState,
} from '../selectors';
import { editMap, commitMapEdit } from '../actions';

const collisionPalette = new Uint8Array(256 * 4);
collisionPalette.set([
  0, 0, 0, 0,
  0, 0, 0, Math.floor(0.0 * 255),
]);

const heightAlpha = Math.floor(0.6 * 255);
const heightPalette = new Uint8Array(256 * 4);
heightPalette.set([
  255, 0, 0, heightAlpha,
  0, 255, 0, heightAlpha,
  0, 0, 255, heightAlpha,
  255, 255, 0, heightAlpha,
  0, 255, 255, heightAlpha,
  255, 0, 255, heightAlpha,
]);

export class MainMapLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    palette: Uint8Array,
    tileset: Uint8Array,
    tilemaps: Array<Uint8Array>,
    height: Uint8Array,
    collision: Uint8Array,
    editMap: Function,
    commitMapEdit: Function,
    dimensions: [number, number],
    toolState: Object,
  }

  handleMouseMove = (start, end, event) => {
    this.props.editMap(this.props.toolState, start, end, event);
    event.stopPropagation();
  };

  handleMouseUp = (start, end, event) => {
    this.props.commitMapEdit();
    event.stopPropagation();
  };

  render() {
    const { dimensions: [width, height] } = this.props;

    return (
      <Group>
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
          onMouseDown={this.handleMouseMove}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          bounded
        />
        <Colormap
          width={width * 16}
          height={height * 16}
          tileWidth={16}
          tileHeight={16}
          transparent
          palette={heightPalette}
          tilemap={this.props.height}
        />
        <Colormap
          width={width * 16}
          height={height * 16}
          tileWidth={16}
          tileHeight={16}
          transparent
          palette={collisionPalette}
          tilemap={this.props.collision}
        />
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: makeSelectMainMapDimensions(),
  palette: makeSelectMainMapPalette(),
  tileset: makeSelectMainMapTileset(),
  tilemaps: makeSelectMainMapTilemaps(),
  toolState: makeSelectToolState(),
  collision: makeSelectMainMapCollisionMap(),
  height: makeSelectMainMapHeightMap(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    editMap(toolState, start, end, modifiers) {
      tabDispatch(editMap(toolState, start, end, modifiers));
    },
    commitMapEdit() {
      tabDispatch(commitMapEdit());
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(MainMapLayer);
