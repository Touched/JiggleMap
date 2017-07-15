/* @flow */

export function drawLine<T>(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  drawPoint: (x: number, y: number) => T,
): Array<T> {
  const points = [];
  const dx = x1 - x0;
  const dy = y1 - y0;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const sx = dx > 0 ? 1 : -1;
  const sy = dy > 0 ? 1 : -1;
  let eps = 0;

  if (adx > ady) {
    for (let x = x0, y = y0; sx < 0 ? x >= x1 : x <= x1; x += sx) {
      points.push(drawPoint(x, y));
      eps += ady;
      if ((eps << 1) >= adx) { // eslint-disable-line no-bitwise
        y += sy;
        eps -= adx;
      }
    }
  } else {
    for (let x = x0, y = y0; sy < 0 ? y >= y1 : y <= y1; y += sy) {
      points.push(drawPoint(x, y));
      eps += adx;
      if ((eps << 1) >= ady) { // eslint-disable-line no-bitwise
        x += sx;
        eps -= ady;
      }
    }
  }

  return points;
}
