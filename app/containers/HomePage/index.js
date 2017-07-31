/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import CircleIcon from 'mdi-react/CircleIcon';
import MapIcon from 'mdi-react/MapIcon';

import { setSidebarItem } from 'containers/App/actions';
import { makeSelectSidebarItem } from 'containers/App/selectors';
import Sidebar from 'components/Sidebar';
import EditorTabs, { EditorTabsBar } from 'containers/EditorTabs';
import MainDrawer from 'containers/App/Sidebar/MainDrawer';
import EntityDrawer from 'containers/App/Sidebar/EntityDrawer';
import { buildTabRoutes } from '../../tabs';
import './styles.scss';

const sidebarItems = [{
  id: 'main',
  icon: <CircleIcon />,
  component: <MainDrawer />,
}, {
  id: 'maps',
  icon: <MapIcon />,
  component: <EntityDrawer type="map" />,
}];

const tabRoutes = buildTabRoutes();

export class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    sidebarItem: PropTypes.string,
    setSidebarItem: PropTypes.func,
  };

  static defaultProps = {
    sidebarItem: null,
    setSidebarItem: null,
  };

  render() {
    const { sidebarItem, setSidebarItem: setActiveItem } = this.props;

    return (
      <div className="HomePage">
        <EditorTabsBar />
        <div className="HomePage__container">
          <Sidebar
            items={sidebarItems}
            active={sidebarItem}
            setActiveItem={setActiveItem}
          />
          <EditorTabs routes={tabRoutes} />
        </div>
      </div>
    );
  }
}


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

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
