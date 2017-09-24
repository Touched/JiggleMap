import {
  makeSelectMapPalette,
  makeSelectMapBlocks,
  makeSelectMapTileset,
  buildLayersForMap,
} from '../mapSelectors';

const fill = (n, f) => [...Array(n)].map(f);

describe('makeSelectMapPalette', () => {
  const createPalette = (x) => fill(16, () => [x, x, x, x]);
  const createPalettes = (x) => fill(16, () => createPalette(x));

  const state = {
    blocksets: {
      primary: {
        palette: createPalettes(0),
      },
      secondary: {
        palette: createPalettes(1),
      },
    },
  };

  const selector = makeSelectMapPalette();

  it('merges the palettes of the two blocksets into a flat Uint8Array', () => {
    const zeroes = fill(7 * 16 * 4, () => 0);
    const ones = fill(9 * 16 * 4, () => 1);
    const expected = Uint8Array.from(zeroes.concat(ones));
    expect(selector(state)).toEqual(expected);
  });
});

describe('makeSelectMapTileset', () => {
  const state = {
    blocksets: {
      primary: {
        tiles: [1, 2, 3],
      },
      secondary: {
        tiles: [4, 5, 6],
      },
    },
  };

  const selector = makeSelectMapTileset();

  it('merges the tiles of both blocksets into an array', () => {
    const expected = new Uint8Array([1, 2, 3, 4, 5, 6]);
    expect(selector(state)).toEqual(expected);
  });
});


describe('makeSelectMapBlocks', () => {
  const makeTile = (tile) => ({ tile, flipX: false, flipY: false, palette: 0 });
  const makeBlock = (tile) => ({ tiles: fill(8, () => makeTile(tile)) });
  const makeBlockset = (tile, n) => fill(n, () => makeBlock(tile));

  const primary = makeBlockset(0, 10);
  const secondary = makeBlockset(0, 5);

  const state = {
    blocksets: {
      primary: {
        blocks: primary,
      },
      secondary: {
        blocks: secondary,
      },
    },
  };

  const selector = makeSelectMapBlocks();

  it('merges the tile definitions of the two blocksets', () => {
    const expected = primary.map(({ tiles }) => tiles).concat(secondary.map(({ tiles }) => tiles));
    expect(selector(state)).toEqual(expected);
  });
});

describe('buildLayersForMap', () => {
  it('builds a tilemap layer for each set of blocks', () => {
    const makeTile = (tile, flipX, flipY, palette) => ({ tile, flipX, flipY, palette });

    const data = [
      0, 1,
      1, 3,
    ];
    const dimensions = [2, 2];
    const blocks = [[
      makeTile(0, true, true, 1), makeTile(0, true, true, 1),
      makeTile(1, false, false, 1), makeTile(1, false, false, 1),
      makeTile(2, true, false, 1), makeTile(2, true, false, 1),
      makeTile(3, false, true, 1), makeTile(4, false, true, 1),
    ], [
      makeTile(4, true, true, 2), makeTile(4, true, true, 2),
      makeTile(5, false, false, 2), makeTile(5, false, false, 2),
      makeTile(6, true, false, 2), makeTile(6, true, false, 2),
      makeTile(7, false, true, 2), makeTile(7, false, true, 2),
    ]];

    const result = buildLayersForMap(data, dimensions, blocks);
    const expected = [
      new Uint8Array([
        0, 0, 3, 1, 0, 0, 3, 1,
        4, 0, 3, 2, 4, 0, 3, 2,
        1, 0, 0, 1, 1, 0, 0, 1,
        5, 0, 0, 2, 5, 0, 0, 2,
        4, 0, 3, 2, 4, 0, 3, 2,
        0, 0, 0, 0, 0, 0, 0, 0,
        5, 0, 0, 2, 5, 0, 0, 2,
        0, 0, 0, 0, 0, 0, 0, 0,
      ]),
      new Uint8Array([
        2, 0, 1, 1, 2, 0, 1, 1,
        6, 0, 1, 2, 6, 0, 1, 2,
        3, 0, 2, 1, 4, 0, 2, 1,
        7, 0, 2, 2, 7, 0, 2, 2,
        6, 0, 1, 2, 6, 0, 1, 2,
        0, 0, 0, 0, 0, 0, 0, 0,
        7, 0, 2, 2, 7, 0, 2, 2,
        0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    ];

    expect(result).toEqual(expected);
  });
});

