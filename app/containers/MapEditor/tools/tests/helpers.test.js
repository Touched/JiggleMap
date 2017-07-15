import { drawLine } from '../helpers';

describe('MapEditor tool helpers', () => {
  describe('drawLine', () => {
    function drawPoint(x, y) {
      return { x, y };
    }

    it('draws one point', () => {
      const line = [{ x: 0, y: 0 }];
      expect(drawLine(0, 0, 0, 0, drawPoint)).toEqual(line);
    });

    it('draws a horizontal line increasing on the x-axis', () => {
      const line = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
        { x: 6, y: 1 },
      ];

      expect(drawLine(1, 1, 6, 1, drawPoint)).toEqual(line);
    });

    it('draws a vertical line decreasing on the y-axis', () => {
      const line = [
        { x: 1, y: 6 },
        { x: 1, y: 5 },
        { x: 1, y: 4 },
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
      ];

      expect(drawLine(1, 6, 1, 1, drawPoint)).toEqual(line);
    });

    it('draws a 45 degree diagonal line', () => {
      const line = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
        { x: 5, y: 5 },
      ];

      expect(drawLine(1, 1, 5, 5, drawPoint)).toEqual(line);
    });

    it('can draw a line between any two points', () => {
      const line = [
        { x: 5, y: 9 },
        { x: 4, y: 8 },
        { x: 3, y: 8 },
        { x: 2, y: 7 },
        { x: 1, y: 7 },
      ];

      expect(drawLine(5, 9, 1, 7, drawPoint)).toEqual(line);
    });

    it('allows a user specified draw function', () => {
      const result = [1, 3];

      function sumPoint(x, y) {
        return x + y;
      }

      expect(drawLine(1, 0, 2, 1, sumPoint)).toEqual(result);
    });
  });
});
