import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Renderer, calculateBoundingRectangle } from 'components/Renderer';
import Map from 'components/Map';
import BlockPalette from 'components/BlockPalette';

import mapData from './data/map';

const { left, top } = calculateBoundingRectangle(0, 0, 16 * mapData.width, 16 * mapData.height, 0, 0);

function SampleMap(props) {
  return (
    <Renderer x={left} y={top} width={mapData.width * 16} height={mapData.height * 16}>
      <Map
        width={mapData.width}
        height={mapData.height}
        blocksets={mapData.blocksets}
        map={mapData.map}
        {...props}
      />
    </Renderer>
  );
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { // eslint-disable-line no-plusplus
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]; // eslint-disable-line no-param-reassign
  }
  return a;
}

class ShuffleMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      map: {
        ...mapData.map,
        block: mapData.map.block.slice(),
      },
    };
  }

  componentDidMount() {
    this.shuffleMap();
  }

  shuffleMap = () => {
    this.setState((state) => {
      setTimeout(this.shuffleMap, 100);

      return {
        map: {
          ...state.map,
          block: shuffle(state.map.block),
        },
      };
    });
  };

  render() {
    return (
      <Renderer x={left} y={top} width={mapData.width * 16} height={mapData.height * 16}>
        <Map
          width={mapData.width}
          height={mapData.height}
          blocksets={mapData.blocksets}
          map={this.state.map}
        />
      </Renderer>
    );
  }
}

storiesOf('Map', module)
  .add('normal', () => <SampleMap />)
  .add('darken filter', () => <SampleMap darken />)
  .add('collision map', () => <SampleMap showCollisionMap />)
  .add('height map', () => <SampleMap showHeightMap />)
  .add('stress test', () => <ShuffleMap />);

function SamplePalette(props) {
  return (
    <BlockPalette
      width={mapData.width}
      height={mapData.height}
      blocksets={mapData.blocksets}
      map={mapData.map}
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
