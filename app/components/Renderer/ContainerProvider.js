/* @flow */

import React, { PropTypes } from 'react';

export const containerShape = PropTypes.shape({
  width: PropTypes.number,
  height: PropTypes.number,
});

// This is a helper to prevent a bug where context was not being passed down
// through the React3 component. This simply passes the props down as context
// to the child components.
export default class ContainerProvider extends React.Component<*, *> {
  static propTypes = {
    container: containerShape.isRequired,
    children: PropTypes.node.isRequired,
    tabId: PropTypes.string.isRequired,
    store: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    container: containerShape,
    tabId: PropTypes.string,
    store: PropTypes.object,
  };

  getChildContext() {
    return {
      container: this.props.container,
      tabId: this.props.tabId,
      store: this.props.store,
    };
  }

  render() {
    return <group>{this.props.children}</group>;
  }
}
