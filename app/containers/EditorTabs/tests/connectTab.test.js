import React from 'react';
import { mount } from 'enzyme';

import connectTab from '../connectTab';
import { relayActionToTab } from '../actions';

describe('connectTab', () => {
  const tabId = '18';
  const mapStateToProps = jest.fn(() => ({ stateProp: 'stateProp' }));
  const mapTabStateToProps = jest.fn(() => ({ tabStateProp: 'tabStateProp' }));
  const mapDispatchToProps = jest.fn(() => ({ dispatchProp: 'dispatchProp' }));
  const mapTabDispatchToProps = jest.fn(() => ({ tabDispatchProp: 'tabDispatchProp' }));

  const Component = () => <div>Test</div>;
  const ConnectedComponent = connectTab(
    mapStateToProps,
    mapTabStateToProps,
    mapDispatchToProps,
    mapTabDispatchToProps,
  )(Component);

  const tabState = 'state';

  const state = {
    a: '1',
    b: '2',
    c: '3',
    editorTabs: {
      byId: {
        18: {
          state: tabState,
        },
      },
    },
  };

  const store = {
    getState() {
      return state;
    },
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  };

  const enzymeOptions = {
    context: {
      store,
      tabId,
    },
    childContextTypes: {
      store: React.PropTypes.any,
    },
  };

  it('connects the component', () => {
    const wrapper = mount(<ConnectedComponent foo="bar" />, enzymeOptions);

    const props = { foo: 'bar' };

    expect(wrapper.find(Component).props()).toEqual({
      ...props,
      stateProp: 'stateProp',
      dispatchProp: 'dispatchProp',
      tabStateProp: 'tabStateProp',
      tabDispatchProp: 'tabDispatchProp',
    });

    expect(mapStateToProps).toHaveBeenCalledWith(state, props, tabId);
    expect(mapDispatchToProps).toHaveBeenCalledWith(store.dispatch, props, tabId);

    expect(mapTabStateToProps).toHaveBeenCalledWith(tabState, props, tabId);
    expect(mapTabDispatchToProps).toHaveBeenCalled();
  });

  it('mapDispatchToProps creates a tab dispatcher that relays the action to a tab', () => {
    const action = { type: 'ACTION' };

    const TabComponent = connectTab(null, null, null, (tabDispatch) => ({
      testTabDispatch() {
        tabDispatch(action);
      },
    }))(Component);

    const wrapper = mount(<TabComponent />, enzymeOptions);

    wrapper.find(Component).prop('testTabDispatch')();
    expect(store.dispatch).toHaveBeenLastCalledWith(relayActionToTab(tabId, action));
  });
});
