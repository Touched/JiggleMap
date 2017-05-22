/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { setSidebarItem } from 'containers/App/actions';
import { makeSelectSidebarItem } from 'containers/App/selectors';
import Sidebar from 'components/Sidebar';
import MainDrawer from './Sidebar/MainDrawer';
import EntityDrawer from './Sidebar/EntityDrawer';

const sidebarItems = [{
  id: 'main',
  icon: 'General',
  component: <MainDrawer />,
}, {
  id: 'maps',
  icon: 'Maps',
  component: <EntityDrawer type="map" />,
}];

export class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node,
  };

  render() {
    const { sidebarItem, setSidebarItem: setActiveItem } = this.props;

    return (
      <div>
        <Sidebar
          items={sidebarItems}
          active={sidebarItem}
          setActiveItem={setActiveItem}
        />
        {React.Children.toArray(this.props.children)}
      </div>
    );
  }
}

App.propTypes = {
  setSidebarItem: PropTypes.func,
  sidebarItem: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  sidebarItem: makeSelectSidebarItem(),
});

export function mapDispatchToProps(dispatch) {
  return {
    setSidebarItem(item) {
      dispatch(setSidebarItem(item));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
