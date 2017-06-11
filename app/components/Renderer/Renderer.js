/* @flow */

import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';

import ContainerProvider from './ContainerProvider';
import { FOV } from './constants';

type RendererProps = {
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  near: number,
  far: number,
  children: React$Component<*, *, *>,
};

export default function Renderer({ x, y, z, width, height, near, far, children }: RendererProps) {
  return (
    <React3
      mainCamera="camera"
      width={width}
      height={height}
      pixelRatio={window.devicePixelRatio}
      alpha
    >
      <scene>
        <perspectiveCamera
          name="camera"
          fov={FOV}
          aspect={width / height}
          near={near - 0.0001}
          far={far}
          position={new THREE.Vector3(x, y, z)}
        />
        <ContainerProvider container={{ width, height }}>
          {children}
        </ContainerProvider>
      </scene>
    </React3>
  );
}
