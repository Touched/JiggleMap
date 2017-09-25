import { createSelector, createStructuredSelector } from 'reselect';
import { createArraySelector } from 'reselect-map';
import R from 'ramda';

const selectMapBlocksetPalette = (type) => (state) => state.blocksets[type].palette;
const selectMapBlocksetBlocks = (type) => (state) => state.blocksets[type].blocks;
const selectMapBlocksetTileset = (type) => (state) => state.blocksets[type].tiles;

const selectMapBlockData = () => (state) => state.map.block;
const selectMapCollisionData = () => (state) => Uint8Array.from(state.map.collision);
const selectMapHeightData = () => (state) => Uint8Array.from(state.map.height);
const selectMapDimensions = () => (state) => state.map.dimensions;
const selectMapObject = () => (state) => state.map;

/**
 * Concatenate the palettes of the primary and secondary blocksets
 */
const makeSelectMapPalette = () => createSelector(
  selectMapBlocksetPalette('primary'),
  selectMapBlocksetPalette('secondary'),
  (primary, secondary) => Uint8Array.from(
    R.flatten(R.concat(primary.slice(0, 7), secondary.slice(7, 16))),
  ),
);

/**
 * Concatenate the tilesets of the primary and secondary blocksets
 */
const makeSelectMapTileset = () => createSelector(
  selectMapBlocksetTileset('primary'),
  selectMapBlocksetTileset('secondary'),
  (primary, secondary) => Uint8Array.from(primary.concat(secondary)),
);

/**
 * Concatenate the blocks of the primary and secondary blocksets.
 */
const makeSelectMapBlocks = () => createSelector(
  selectMapBlocksetBlocks('primary'),
  selectMapBlocksetBlocks('secondary'),
  (primary, secondary) => {
    const allTiles = R.map(R.prop('tiles'));
    return R.concat(allTiles(primary), allTiles(secondary));
  },
);

function translate({ tile, flipX, flipY, palette }) {
  return [
    tile % 16, // tilesetWidthInTiles
    Math.floor(tile / 16),
    flipX | (flipY << 1), // eslint-disable-line no-bitwise
    palette,
  ];
}

const defaultTile = {
  flipX: false,
  flipY: false,
  palette: 0,
  tile: 0,
};

const defaultBlock = R.repeat(defaultTile, 8);

export function buildLayersForMap(data, [width, height], blocks) {
  const layers = [
    Array(width * height * 4),
    Array(width * height * 4),
  ];

  const stride = width * 2;
  const mapBlocks = data;

  for (let y = 0; y < height; y++) { // eslint-disable-line no-plusplus
    for (let x = 0; x < width; x++) { // eslint-disable-line no-plusplus
      const index = (y * stride * 2) + (x * 2);
      const block = mapBlocks[(y * width) + x];
      const blockTiles = blocks[block] || defaultBlock;

      layers[0][index] = translate(blockTiles[0]);
      layers[0][index + 1] = translate(blockTiles[1]);
      layers[0][index + stride] = translate(blockTiles[2]);
      layers[0][index + stride + 1] = translate(blockTiles[3]);

      layers[1][index] = translate(blockTiles[4]);
      layers[1][index + 1] = translate(blockTiles[5]);
      layers[1][index + stride] = translate(blockTiles[6]);
      layers[1][index + stride + 1] = translate(blockTiles[7]);
    }
  }

  return [
    Uint8Array.from([].concat(...layers[0])),
    Uint8Array.from([].concat(...layers[1])),
  ];
}

/**
 * Build a tilemap for the map data given the blocksets
 */
const makeSelectMapTilemaps = () => createSelector(
  selectMapBlockData(),
  selectMapDimensions(),
  makeSelectMapBlocks(),
  buildLayersForMap,
);

const makeSelectMapBlockset = () => createSelector(
  makeSelectMapBlocks(),
  (blocks) => buildLayersForMap(R.range(0, blocks.length), [8, blocks.length / 8], blocks),
);

const makeSelectConnectionPosition = ([theirWidth, theirHeight]) => createSelector(
  (state) => state.offset,
  (state) => state.direction,
  selectMapDimensions(),
  (offset, direction, [myWidth, myHeight]) => {
    switch (direction) {
      case 'up':
        return {
          x: offset,
          y: -myHeight,
        };
      case 'down':
        return {
          x: offset,
          y: theirHeight,
        };
      case 'left':
        return {
          x: -myWidth,
          y: offset,
        };
      case 'right':
        return {
          x: theirWidth,
          y: offset,
        };
      default:
        return {
          x: 0,
          y: 0,
        };
    }
  },
);

const makeSelectMainMap = () => (state) => state.data.present;
const makeSelectMainMapDimensions = () => createSelector(
  makeSelectMainMap(),
  selectMapDimensions(),
);
const makeSelectMainMapPalette = () => createSelector(
  makeSelectMainMap(),
  makeSelectMapPalette(),
);
const makeSelectMainMapTileset = () => createSelector(
  makeSelectMainMap(),
  makeSelectMapTileset(),
);
const makeSelectMainMapTilemaps = () => createSelector(
  makeSelectMainMap(),
  makeSelectMapTilemaps(),
);
const makeSelectMainMapBlockset = () => createSelector(
  makeSelectMainMap(),
  makeSelectMapBlockset(),
);
const makeSelectMainMapEntities = () => createSelector(
  makeSelectMainMap(),
  R.prop('entities'),
);
const makeSelectMainMapCollisionMap = () => createSelector(
  makeSelectMainMap(),
  selectMapCollisionData(),
);
const makeSelectMainMapHeightMap = () => createSelector(
  makeSelectMainMap(),
  selectMapHeightData(),
);
const makeSelectMainMapObject = () => createSelector(
  makeSelectMainMap(),
  selectMapObject(),
);

const makeSelectConnectedMap = (dimensions) => createStructuredSelector({
  tilemaps: makeSelectMapTilemaps(),
  palette: makeSelectMapPalette(),
  tileset: makeSelectMapTileset(),
  dimensions: selectMapDimensions(),
  position: makeSelectConnectionPosition(dimensions),
  collisionMap: selectMapCollisionData(),
  heightMap: selectMapHeightData(),
});

const makeSelectConnectedMaps = () => createArraySelector(
  (state) => state.data.present.connections,
  makeSelectMainMapDimensions(),
  (connection, dimensions) => makeSelectConnectedMap(dimensions)(connection),
);

export {
  makeSelectMapTileset,
  makeSelectConnectedMaps,
  makeSelectMainMapBlockset,
  makeSelectMainMapDimensions,
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectMainMapEntities,
  makeSelectMainMapCollisionMap,
  makeSelectMainMapHeightMap,
  makeSelectMainMapObject,
  makeSelectMapPalette,
  makeSelectMapBlocks,
};
