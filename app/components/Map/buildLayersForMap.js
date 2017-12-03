import R from 'ramda';

const defaultTile = {
  flipX: false,
  flipY: false,
  palette: 0,
  tile: 0,
};

const defaultBlock = R.repeat(defaultTile, 8);

function translate({ tile, flipX, flipY, palette }) {
  return [
    tile % 16, // tilesetWidthInTiles
    Math.floor(tile / 16),
    flipX | (flipY << 1), // eslint-disable-line no-bitwise
    palette,
  ];
}

export default function buildLayersForMap(width, height, data, blocks) {
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
