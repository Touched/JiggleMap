import React from 'react';
import { shallow } from 'enzyme';

import ConnectedMap from '../ConnectedMap';
import ToolHitBox from '../ToolHitBox';
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

  it('renders an HTML element', () => {
    const onDrag = () => null;
    const onDragEnd = () => null;

    const wrapper = shallow(
      <ConnectedMap
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        x={1}
        y={2}
        z={3}
        width={10}
        height={15}
      />
    );

    expect(wrapper.find(ToolHitBox).node).toBeDefined();
    expect(wrapper.find(ToolHitBox).props()).toMatchObject({
      width: 160,
      height: 240,
      objectType: 'connected-map',
    });
  });
});
