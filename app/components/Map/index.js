/* @flow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Colormap, GBATilemap, Group } from 'components/Renderer';
import R from 'ramda';

import buildLayersForMap from './buildLayersForMap';

type Tile = {
  tile: number;
  palette: number;
  flipX: bool;
  flipY: bool;
};

type Block = {
  tiles: Array<Tile>;
};

type Blockset = {
  tiles: Array<number>; // eslint-disable-line react/no-unused-prop-types
  palette: Array<Array<Array<number>>>, // eslint-disable-line react/no-unused-prop-types
  blocks: Array<Block>; // eslint-disable-line react/no-unused-prop-types
};

type Props = {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  map: {
    block: Array<number>; // eslint-disable-line react/no-unused-prop-types
    height: Array<number>; // eslint-disable-line react/no-unused-prop-types
    collision: Array<number>; // eslint-disable-line react/no-unused-prop-types
  };
  blocksets: {
    primary: Blockset;
    secondary: Blockset;
  };
  darken: boolean;
  showHeightMap: bool,
  showCollisionMap: bool,
};

const darkenFilter = `
color.r *= 0.5;
color.g *= 0.5;
color.b *= 0.5;
`;

const collisionPalette = new Uint8Array(256 * 4);
collisionPalette.set([
  0, 0, 0, 0,
  255, 0, 0, Math.floor(0.6 * 255),
]);

const heightAlpha = Math.floor(0.6 * 255);
const heightPalette = new Uint8Array(256 * 4);
heightPalette.set([
  0, 0, 255, heightAlpha,
  0, 255, 0, heightAlpha,
  255, 0, 0, heightAlpha,
  255, 255, 0, heightAlpha,
  0, 255, 255, heightAlpha,
  255, 0, 255, heightAlpha,
]);

export default class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = this.buildState(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.buildState(nextProps));
  }

  buildState({ width, height, blocksets, map, showHeightMap, showCollisionMap }) {
    // TODO: Optimize: only update the properties that changed
    return {
      tileset: this.buildTileset(blocksets),
      palette: this.buildPalette(blocksets),
      tilemapLayers: this.buildTilemapLayers(width, height, blocksets, map.block),
      heightMap: showHeightMap ? Uint8Array.from(map.height) : null,
      collisionMap: showCollisionMap ? Uint8Array.from(map.collision) : null,
    };
  }

  buildTileset(blocksets) {
    const { primary, secondary } = blocksets;
    return Uint8Array.from(primary.tiles.concat(secondary.tiles));
  }

  buildPalette(blocksets) {
    const { primary, secondary } = blocksets;

    return Uint8Array.from(
      R.flatten(R.concat(primary.palette.slice(0, 7), secondary.palette.slice(7, 16))),
    );
  }

  buildTilemapLayers(width, height, blocksets, data) {
    const { primary, secondary } = blocksets;

    const allTiles = R.map(R.prop('tiles'));
    const blockset = R.concat(allTiles(primary.blocks), allTiles(secondary.blocks));

    return buildLayersForMap(width, height, data, blockset);
  }

  props: Props;

  render() {
    const { width, height, x, y, z, darken, showHeightMap, showCollisionMap } = this.props;
    const { tileset, palette, tilemapLayers, heightMap, collisionMap } = this.state;

    return (
      <Group z={z} y={y * 16} x={x * 16}>
        {tilemapLayers.map((tilemap, i) => (
          <GBATilemap
            key={i}
            colorFilter={darken ? darkenFilter : ''}
            width={width * 16}
            height={height * 16}
            tileset={tileset}
            tilemap={tilemap}
            palette={palette}
            transparent
          />
        ))}
        {showHeightMap && <Colormap
          width={width * 16}
          height={height * 16}
          tileWidth={16}
          tileHeight={16}
          transparent
          palette={heightPalette}
          tilemap={heightMap}
        />}
        {showCollisionMap && <Colormap
          width={width * 16}
          height={height * 16}
          tileWidth={16}
          tileHeight={16}
          transparent
          palette={collisionPalette}
          tilemap={collisionMap}
        />}
      </Group>
    );
  }
}

Map.defaultProps = {
  x: 0,
  y: 0,
  z: 0,
  darken: false,
  tilemaps: [],
};
