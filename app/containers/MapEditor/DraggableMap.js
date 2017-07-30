import React from 'react';

import { DraggableArea, Group } from 'components/Renderer';
import Map from './Map';

type Position = {
  x: number;
  y: number;
};

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
  onDrag: (Position, Position, AreaEvent) => void;
};

export default function DraggableMap(props: Props) {
  const { x, y, z, width, height, tileset, tilemaps, palette, darken, onDrag } = props;

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
        darken={darken}
      />
      <DraggableArea
        x={x}
        y={y}
        z={z}
        width={width}
        height={height}
        onDrag={onDrag}
      />
    </Group>
  );
}
