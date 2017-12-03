import React from 'react';
import { shallow } from 'enzyme';

import Map from 'components/Map';
import ConnectedMap from '../ConnectedMap';

describe('<ConnectedMap />', () => {
  it('renders a <Map />', () => {
    const wrapper = shallow(
      <ConnectedMap
        map={{}}
        blocksets={{}}
        x={1}
        y={2}
        z={3}
        width={10}
        height={15}
        darken
      />
    );

    expect(wrapper.find(Map).node).toBeDefined();
  });
});
