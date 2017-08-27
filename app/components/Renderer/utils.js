/* @flow */

import svgMesh3d from 'svg-mesh-3d';
import threeSimplicialComplex from 'three-simplicial-complex';
import * as THREE from 'three';

const Complex = threeSimplicialComplex(THREE);

export function calculateBoundingRectangle(
  containerWidth: number,
  containerHeight: number,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  return {
    width,
    height,
    top: -(y + (height / 2)),
    left: (x + (width / 2)),
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
