import React from 'react';
import { shallow } from 'enzyme';

import { Colormap, GBATilemap, Group } from 'components/Renderer';
import Map from '../';

describe('<Map />', () => {
  const blocksets = {
    primary: {
      tiles: [],
      palette: [],
      blocks: [],
    },
    secondary: {
      tiles: [],
      palette: [],
      blocks: [],
    },
  };

  it('returns a GBATilemap layer for every tilemap', () => {
    const map = { block: [] };

    const wrapper = shallow(<Map map={map} blocksets={blocksets} width={1} height={1} />);

    expect(wrapper.find(GBATilemap)).toHaveLength(2);
    expect(wrapper.find(Colormap)).toHaveLength(0);
  });

  it('passes props down to the tilemap', () => {
    const map = { block: [] };

    const wrapper = shallow(
      <Map map={map} blocksets={blocksets} width={10} height={5} />
    );

    expect(wrapper.find(GBATilemap).get(0).props).toMatchObject({
      width: 10 * 16,
      height: 5 * 16,
    });
  });

  it('passes coordinates to the containing group', () => {
    const map = { block: [] };

    const wrapper = shallow(
      <Map map={map} blocksets={blocksets} width={1} height={1} x={10} y={5} />
    );

    expect(wrapper.find(Group).props()).toMatchObject({
      x: 10 * 16,
      y: 5 * 16,
    });
  });

  it('passes a dark filter if set to darken', () => {
    const map = { block: [] };
    const wrapper = shallow(<Map map={map} blocksets={blocksets} width={1} height={1} darken />);
    expect(wrapper.find(GBATilemap).first().prop('colorFilter')).not.toEqual('');
  });

  it('renders a height map', () => {
    const map = {
      height: [],
      block: [],
    };

    const wrapper = shallow(<Map map={map} blocksets={blocksets} width={10} height={5} showHeightMap />);

    expect(wrapper.find(Colormap).props()).toMatchObject({
      width: 10 * 16,
      height: 5 * 16,
      tilemap: new Uint8Array(),
    });
  });

  it('renders a collision map', () => {
    const map = {
      collision: [],
      block: [],
    };

    const wrapper = shallow(<Map map={map} blocksets={blocksets} width={10} height={5} showCollisionMap />);

    expect(wrapper.find(Colormap).props()).toMatchObject({
      width: 10 * 16,
      height: 5 * 16,
      tilemap: new Uint8Array(),
    });
  });
});
