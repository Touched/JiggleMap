import { makeSelectMapPalette, makeSelectMapBlocks } from '../selectors';

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
