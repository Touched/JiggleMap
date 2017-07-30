/* @flow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { GBATilemap, Group } from 'components/Renderer';

export default function Map({ width, height, x, y, z, tileset, tilemaps, palette }: Props) {
  return (
    <Group z={z} y={y * 16}>
      {tilemaps.map((tilemap, i) => (
        <GBATilemap
          key={i}
          x={x * 16}
          y={0}
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
