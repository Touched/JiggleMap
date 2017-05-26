import React, { PropTypes } from 'react';
import { shallow, mount } from 'enzyme';

import NewTab from 'components/NewTab';
import WelcomeTab from 'components/WelcomeTab';
import { EditorTabs } from '../index';

describe('<EditorTab />', () => {
  class TestTab extends React.Component { // eslint-disable-line react/prefer-stateless-function
    static contextTypes = {
      tabId: PropTypes.string,
    };

    render() {
      const { tabId } = this.context;
      return <div>{tabId}</div>;
    }
  }

  const routes = {
    test: TestTab,
  };

  it('renders welcome page if there is no active tab', () => {
    const wrapper = shallow(<EditorTabs activeTab={null} routes={routes} />);
    expect(wrapper.find(WelcomeTab).node).toBeDefined();
  });

  it('renders the new tab page if the active tab type is null', () => {
    const newTab = {
      kind: null,
    };

    const wrapper = shallow(<EditorTabs activeTab={newTab} routes={routes} />);
    expect(wrapper.find(NewTab).node).toBeDefined();
  });

  it('renders the correct route handler if the tab kind matches', () => {
    const testTab = {
      id: '11',
      kind: 'test',
    };

    const wrapper = mount(<EditorTabs activeTab={testTab} routes={routes} />);

    expect(wrapper.find(TestTab).node).toBeDefined();
    expect(wrapper.find(TestTab).text()).toEqual('11');
  });
});
