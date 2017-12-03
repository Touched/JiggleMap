import React from 'react';

import { Group } from 'components/Renderer';
import Map from 'components/Map';
import ToolHitBox from './ToolHitBox';

type Props = {
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  darken: boolean;
  object: Object;
  showCollisionMap: bool;
  showHeightMap: bool;
  map: Object;
  blocksets: Object;
};

export default function ConnectedMap(props: Props) {
  const {
    x,
    y,
    z,
    width,
    height,
    map,
    blocksets,
    darken,
    showHeightMap,
    showCollisionMap,
    object,
  } = props;

  return (
    <Group>
      <Map
        x={x}
        y={y}
        z={z}
        width={width}
        height={height}
        map={map}
        blocksets={blocksets}
        showCollisionMap={showCollisionMap}
        showHeightMap={showHeightMap}
        darken={darken}
      />
      <ToolHitBox
        objectType="connected-map"
        x={x * 16}
        y={y * 16}
        width={width * 16}
        height={height * 16}
        object={object}
      />
    </Group>
  );
}
