import {
  makeSelectMapPalette,
  makeSelectMapTileset,
  makeSelectMapTilemaps,
  selectMapCollisionData,
  selectMapHeightData,
} from 'containers/MapEditor/selectors/mapSelectors';

const map = require('./map.json');
const primaryBlockset = require('./blockset-primary.json');
const primaryBlocksetTiles = require('./blockset-primary-tiles.json');
const secondaryBlockset = require('./blockset-secondary.json');
const secondaryBlocksetTiles = require('./blockset-secondary-tiles.json');

const state = {
  blocksets: {
    primary: {
      palette: primaryBlockset.data.palette,
      blocks: primaryBlockset.data.blocks,
      tiles: primaryBlocksetTiles,
    },
    secondary: {
      palette: secondaryBlockset.data.palette,
      blocks: secondaryBlockset.data.blocks,
      tiles: secondaryBlocksetTiles,
    },
  },
  map: {
    dimensions: [map.data.map.width, map.data.map.height],
    block: map.data.map.data.block,
    collision: map.data.map.data.collision,
    height: map.data.map.data.height,
  },
};

export default {
  width: map.data.map.width,
  height: map.data.map.height,
  palette: makeSelectMapPalette()(state),
  tileset: makeSelectMapTileset()(state),
  tilemaps: makeSelectMapTilemaps()(state),
  collisionMap: selectMapCollisionData()(state),
  heightMap: selectMapHeightData()(state),
};
