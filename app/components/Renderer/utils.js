/* @flow */

import svgMesh3d from 'svg-mesh-3d';
import threeSimplicialComplex from 'three-simplicial-complex';
import * as THREE from 'three';

import { FOV_RADIANS, DISTANCE } from './constants';

const Complex = threeSimplicialComplex(THREE);

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

export type Mesh = {
  vertices: Array<THREE.Vector3>;
  faces: Array<THREE.Face3>;
  faceVertexUvs: Array<Array<THREE.UV>>;
};

export function svgPathToMesh(path: string): Mesh {
  return new Complex(svgMesh3d(path));
}
