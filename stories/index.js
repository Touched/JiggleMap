import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Renderer, calculateBoundingRectangle } from 'components/Renderer';
import Map from 'containers/MapEditor/Content/Map';
import BlockPalette from 'containers/MapEditor/tools/BlockPalette';

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

function SamplePalette(props) {
  return (
    <BlockPalette
      width={map.width}
      height={map.height}
      palette={map.palette}
      tileset={map.tileset}
      tilemaps={map.tilemaps}
      onChange={action('select-block')}
      zoom={1}
      {...props}
    />
  );
}


storiesOf('BlockPalette', module)
  .add('normal', () => (
    <SamplePalette />
  ))
  .add('with multiselect', () => (
    <SamplePalette multiselect />
  ))
  .add('with value', () => (
    <SamplePalette value={{ x: 1, y: 1, width: 5, height: 4 }} />
  ))
  .add('with a size limitation', () => (
    <SamplePalette multiselect minWidth={2} maxWidth={5} />
  ));
