/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import warning from 'warning';

import NewTab from 'components/NewTab';
import WelcomeTab from 'components/WelcomeTab';
import { makeSelectEditorTabsActive } from './selectors';

export class EditorTabs extends React.Component<*, *> { // eslint-disable-line react/prefer-stateless-function
  static defaultProps = {
    activeTab: null,
  };

  static childContextTypes = {
    tabId: React.PropTypes.string,
  };

  getChildContext() {
    const { activeTab } = this.props;

    return {
      tabId: activeTab ? activeTab.id : null,
    };
  }

  props: {
    routes: { [string]: React.ComponentType<*> },
    activeTab: ?{
      id: string,
      kind: string,
    },
  }

  render() {
    const { activeTab, routes } = this.props;

    if (!activeTab) {
      return <WelcomeTab />;
    }

    const { kind } = activeTab;

    if (kind === null) {
      return <NewTab />;
    }

    const TabComponent = routes[kind];

    warning(TabComponent, `Unregistered tab type '${kind}'`);

    return TabComponent ? <TabComponent /> : null;
  }
}

export const mapStateToProps = createStructuredSelector({
  activeTab: makeSelectEditorTabsActive(),
});

export default connect(mapStateToProps, null)(EditorTabs);

export { default as EditorTabsBar } from './EditorTabsBar';
