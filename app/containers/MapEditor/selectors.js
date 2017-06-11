import { createSelector } from 'reselect';

const selectMapBlocksetPalette = (type) => (state) => state.getIn(['blocksets', type, 'palette']);
const selectMapBlocksetBlocks = (type) => (state) => state.getIn(['blocksets', type, 'blocks']);
const selectMapBlocksetTileset = (type) => (state) => state.getIn(['blocksets', type, 'tiles']);

const selectMapBlockData = () => (state) => state.getIn(['map', 'block']);
const selectMapDimensions = () => (state) => state.getIn(['map', 'dimensions']);

/**
 * Concatenate the palettes of the primary and secondary blocksets
 */
const makeSelectMapPalette = () => createSelector(
  selectMapBlocksetPalette('primary'),
  selectMapBlocksetPalette('secondary'),
  (primary, secondary) => Uint8Array.from(
    primary.slice(0, 7).concat(secondary.slice(7, 16)).flatten(),
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
  (primary, secondary) => primary.map((block) => block.get('tiles')).concat(
    secondary.map((block) => block.get('tiles')),
  ).toJS(),
);

function translate({ tile, flipX, flipY, palette }) {
  return [
    tile % 16, // tilesetWidthInTiles
    Math.floor(tile / 16),
    flipX | (flipY << 1), // eslint-disable-line no-bitwise
    palette,
  ];
}

function buildLayersForMap(data, [width, height], blocks) {
  const layers = [
    Array(width * height * 4),
    Array(width * height * 4),
  ];

  const stride = width * 2;

  const mapBlocks = data.toJS();

  for (let y = 0; y < height; y++) { // eslint-disable-line no-plusplus
    for (let x = 0; x < width; x++) { // eslint-disable-line no-plusplus
      const index = (y * stride * 2) + (x * 2);
      const block = mapBlocks[(y * width) + x];
      const blockTiles = blocks[block];

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
const makeSelectMapTilemap = () => createSelector(
  selectMapBlockData(),
  selectMapDimensions(),
  makeSelectMapBlocks(),
  buildLayersForMap,
);

export {
  makeSelectMapPalette,
  makeSelectMapTileset,
  makeSelectMapBlocks,
  makeSelectMapTilemap,
};
