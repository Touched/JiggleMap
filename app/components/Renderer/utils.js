/* @flow */

import { FOV_RADIANS, DISTANCE } from './constants';

export function calculateBoundingRectangle(
  containerWidth: number,
  containerHeight: number,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const aspect = containerWidth / containerHeight;

  const verticalFraction = 2 * Math.tan(FOV_RADIANS / 2) * DISTANCE;
  const horizontalFraction = verticalFraction * aspect;

  return {
    width: (width * horizontalFraction) / containerWidth,
    height: (height * verticalFraction) / containerHeight,
    top: (-(y + (height / 2)) * verticalFraction) / containerHeight,
    left: ((x + (width / 2)) * horizontalFraction) / containerWidth,
  };
}
