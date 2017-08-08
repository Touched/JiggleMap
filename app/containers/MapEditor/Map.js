/* @flow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { GBATilemap, Group } from 'components/Renderer';

type Props = {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  tileset: Uint8Array;
  palette: Uint8Array;
  tilemaps: Array<Uint8Array>;
  darken: boolean;
};

const darkenFilter = `
color.r *= 0.5;
color.g *= 0.5;
color.b *= 0.5;
`;

export default function Map({ width, height, x, y, z, tileset, tilemaps, palette, darken }: Props) {
  return (
    <Group z={z} y={y * 16} x={x * 16}>
      {tilemaps.map((tilemap, i) => (
        <GBATilemap
          key={i}
          colorFilter={darken ? darkenFilter : ''}
          width={width * 16}
          height={height * 16}
          tileset={tileset}
          tilemap={tilemap}
          palette={palette}
          transparent
        />
      ))}
    </Group>
  );
}

Map.defaultProps = {
  x: 0,
  y: 0,
  z: 0,
  darken: false,
};
