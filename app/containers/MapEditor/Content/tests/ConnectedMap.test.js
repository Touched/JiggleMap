import React from 'react';
import { shallow } from 'enzyme';

import ConnectedMap from '../ConnectedMap';
import Map from '../Map';

describe('<ConnectedMap />', () => {
  it('renders a <Map />', () => {
    const tilemap = new Uint8Array();
    const tilemaps = [tilemap, tilemap, tilemap];
    const palette = new Uint8Array();
    const tileset = new Uint8Array();
    const heightMap = new Uint8Array();
    const collisionMap = new Uint8Array();

    const wrapper = shallow(
      <ConnectedMap
        tilemaps={tilemaps}
        tileset={tileset}
        palette={palette}
        x={1}
        y={2}
        z={3}
        width={10}
        height={15}
        collisionMap={collisionMap}
        heightMap={heightMap}
        darken
      />
    );

    expect(wrapper.find(Map).node).toBeDefined();
    expect(wrapper.find(Map).props()).toEqual({
      x: 1,
      y: 2,
      z: 3,
      width: 10,
      height: 15,
      darken: true,
      collisionMap,
      heightMap,
      tileset,
      tilemaps,
      palette,
    });
  });
});
