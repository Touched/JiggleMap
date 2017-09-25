import React from 'react';

import { Group } from 'components/Renderer';
import Map from './Map';

type Props = {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  tileset: Uint8Array;
  palette: Uint8Array;
  tilemaps: Array<Uint8Array>;
  heightMap: Uint8Array,
  collisionMap: Uint8Array,
  darken: boolean;
};

export default function ConnectedMap(props: Props) {
  const {
    x,
    y,
    z,
    width,
    height,
    tileset,
    tilemaps,
    palette,
    darken,
    heightMap,
    collisionMap,
  } = props;

  return (
    <Group>
      <Map
        x={x}
        y={y}
        z={z}
        width={width}
        height={height}
        tileset={tileset}
        tilemaps={tilemaps}
        palette={palette}
        collisionMap={collisionMap}
        heightMap={heightMap}
        darken={darken}
      />
    </Group>
  );
}
