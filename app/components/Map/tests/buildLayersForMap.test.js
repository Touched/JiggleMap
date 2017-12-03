import buildLayersForMap from '../buildLayersForMap';

describe('buildLayersForMap', () => {
  it('builds a tilemap layer for each set of blocks', () => {
    const makeTile = (tile, flipX, flipY, palette) => ({ tile, flipX, flipY, palette });

    const data = [
      0, 1,
      1, 3,
    ];

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

    const result = buildLayersForMap(2, 2, data, blocks);
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

