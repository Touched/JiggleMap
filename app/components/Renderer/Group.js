import React from 'react';
import * as THREE from 'three';

import { containerShape } from './ContainerProvider';
import { calculateBoundingRectangle } from './utils';

type GroupProps = { x?: number, y?: number, z?: number, children: Array<ReactElement> | ReactElement };

export default function Group({ x, y, z, children }: GroupProps, { container }) {
  const boundingRectangle = calculateBoundingRectangle(container.width, container.height, 0, 0, x, y);

  return (
    <group renderOrder={z} position={new THREE.Vector3(boundingRectangle.left, boundingRectangle.top, 0)}>
      {children}
    </group>
  );
}

Group.defaultProps = {
  x: 0,
  y: 0,
  z: 0,
};

Group.contextTypes = {
  container: containerShape,
};
