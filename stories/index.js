import React from 'react';

import { storiesOf } from '@storybook/react';

import { Renderer, calculateBoundingRectangle } from 'components/Renderer';
import Map from 'containers/MapEditor/Content/Map';

import map from './data';

const { left, top } = calculateBoundingRectangle(0, 0, 16 * map.width, 16 * map.height, 0, 0);

function SampleMap(props) {
  return (
    <Renderer x={left} y={top} width={map.width * 16} height={map.height * 16}>
      <Map
        width={map.width}
        height={map.height}
        palette={map.palette}
        tileset={map.tileset}
        tilemaps={map.tilemaps}
        {...props}
      />
    </Renderer>
  );
}

storiesOf('Map', module)
  .add('normal', () => <SampleMap />)
  .add('with darken filter', () => <SampleMap darken />)
  .add('with collision map', () => <SampleMap collisionMap={map.collisionMap} />)
  .add('with height map', () => <SampleMap heightMap={map.heightMap} />);

