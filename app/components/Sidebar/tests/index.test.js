import React from 'react';
import { shallow } from 'enzyme';

import Sidebar from '../index';

describe('<Sidebar />', () => {
  it('renders the item component if active item is truthy', () => {
    const item = {
      id: 'item',
      component: 'Sidebar Body',
    };
    const component = shallow(<Sidebar active="item" items={[item]} />);

    expect(component.contains(item.component)).toBe(true);
  });

  it('does not render the item component if the active item is falsy', () => {
    const item = {
      id: 'item',
      component: 'Sidebar Body',
    };
    const component = shallow(<Sidebar active={null} items={[item]} />);

    expect(component.contains(item.component)).toBe(false);
  });

  it('renders the sidebar items', () => {
    const item = {
      id: 'item',
      icon: 'Icon',
    };
    const component = shallow(<Sidebar items={[item]} />);

    expect(component.find('SidebarButton').length).toEqual(1);
  });

  it('clicking a sidebar button toggles the drawer', () => {
    const item = {
      id: 'item',
      component: '',
    };
    const spy = jest.fn();
    const component = shallow(<Sidebar items={[item]} setActiveItem={spy} active={null} />);

    component.find('SidebarButton').first().simulate('click');
    expect(spy).toHaveBeenCalledWith('item');

    component.setProps({ active: 'item' });
    component.find('SidebarButton').first().simulate('click');
    expect(spy).toHaveBeenCalledWith(null);
  });
});
