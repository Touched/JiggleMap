import React from 'react';
import { shallow } from 'enzyme';

import { DraggableArea } from 'components/Renderer';
import DraggableMap from '../DraggableMap';
import Map from '../Map';

describe('<DraggableMap />', () => {
  it('renders a <Map />', () => {
    const tilemap = new Uint8Array();
    const tilemaps = [tilemap, tilemap, tilemap];
    const palette = new Uint8Array();
    const tileset = new Uint8Array();
    const heightMap = new Uint8Array();
    const collisionMap = new Uint8Array();

    const wrapper = shallow(
      <DraggableMap
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

  it('renders a DraggableArea', () => {
    const onDrag = () => null;
    const onDragEnd = () => null;

    const wrapper = shallow(
      <DraggableMap
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        x={1}
        y={2}
        z={3}
        width={10}
        height={15}
      />
    );

    expect(wrapper.find(DraggableArea).node).toBeDefined();
    expect(wrapper.find(DraggableArea).props()).toMatchObject({
      x: 1,
      y: 2,
      z: 3,
      width: 10,
      height: 15,
    });
  });
});
