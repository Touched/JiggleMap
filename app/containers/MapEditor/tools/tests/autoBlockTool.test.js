import { getRoleForPoint, getRoleForBlock } from '../autoBlockTool';

describe('autoBlockTool', () => {
  describe('getRoleForPoint', () => {
    it('determines the name of the square given a rectangle', () => {
      const nw = { x: 1, y: 1 };
      const se = { x: 10, y: 10 };

      expect(getRoleForPoint(1, 1, nw, se)).toEqual('nw');
      expect(getRoleForPoint(10, 1, nw, se)).toEqual('ne');
      expect(getRoleForPoint(1, 10, nw, se)).toEqual('sw');
      expect(getRoleForPoint(10, 10, nw, se)).toEqual('se');
      expect(getRoleForPoint(2, 1, nw, se)).toEqual('n');
      expect(getRoleForPoint(2, 10, nw, se)).toEqual('s');
      expect(getRoleForPoint(10, 2, nw, se)).toEqual('e');
      expect(getRoleForPoint(1, 2, nw, se)).toEqual('w');
      expect(getRoleForPoint(2, 2, nw, se)).toEqual('c');
    });
  });

  describe('getRoleForBlock', () => {
    it('determines the name of the square block index', () => {
      expect(getRoleForBlock(71, {
        nw: 71,
        se: 70,
      })).toEqual('nw');
    });
  });
});
