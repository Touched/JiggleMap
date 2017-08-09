/* @flow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Colormap, GBATilemap, Group } from 'components/Renderer';

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
  heightMap: Uint8Array,
  collisionMap: Uint8Array,
};

const darkenFilter = `
color.r *= 0.5;
color.g *= 0.5;
color.b *= 0.5;
`;

const collisionPalette = new Uint8Array(256 * 4);
collisionPalette.set([
  0, 0, 0, 0,
  0, 0, 0, Math.floor(0.0 * 255),
]);

const heightAlpha = Math.floor(0.6 * 255);
const heightPalette = new Uint8Array(256 * 4);
heightPalette.set([
  255, 0, 0, heightAlpha,
  0, 255, 0, heightAlpha,
  0, 0, 255, heightAlpha,
  255, 255, 0, heightAlpha,
  0, 255, 255, heightAlpha,
  255, 0, 255, heightAlpha,
]);

export default function Map(props: Props) {
  const { width, height, x, y, z, tileset, tilemaps, palette, darken, heightMap, collisionMap } = props;

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
      {heightMap && <Colormap
        width={width * 16}
        height={height * 16}
        tileWidth={16}
        tileHeight={16}
        transparent
        palette={heightPalette}
        tilemap={heightMap}
      />}
      {collisionMap && <Colormap
        width={width * 16}
        height={height * 16}
        tileWidth={16}
        tileHeight={16}
        transparent
        palette={collisionPalette}
        tilemap={collisionMap}
      />}
    </Group>
  );
}

Map.defaultProps = {
  x: 0,
  y: 0,
  z: 0,
  darken: false,
  tilemaps: [],
};
