/**
*
* Sidebar
*
*/

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React, { PropTypes } from 'react';
import { Icon, Tooltip, Position } from '@blueprintjs/core';
import classNames from 'classnames';

import styles from './styles.scss';

function SidebarButton({ onClick, active, icon, primary, tooltip }) {
  const classes = {
    'Sidebar__item--active': active,
    'Sidebar__item--primary': primary,
  };

  return (
    <li>
      <Tooltip content={tooltip} position={Position.RIGHT}>
        <button className={classNames(styles.sidebarIcon, classes)} onClick={onClick}>
          <Icon iconSize={Icon.SIZE_LARGE} iconName={icon} />
        </button>
      </Tooltip>
    </li>
  );
}

SidebarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  icon: PropTypes.node,
  primary: PropTypes.bool,
  tooltip: PropTypes.string,
};

SidebarButton.defaultProps = {
  active: false,
  icon: null,
  primary: false,
  tooltip: '',
};

export function Drawer({ header, footer, items, onItemClick }) {
  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>{header}</div>
      <ul className={styles.drawerList}>
        {items.map((item) => (
          <li key={item.id} className={styles.drawerListItem} onClick={() => onItemClick(item.id)}>
            <div style={{ flexGrow: 1 }}>
              {item.name}
              <div className="pt-text-muted">{item.description}</div>
            </div>
            <button className="pt-button pt-minimal pt-icon-caret-down" />
          </li>
        ))}
      </ul>
      <div className={styles.drawerFooter}>{footer}</div>
      <div className={styles.sidebarShadow} />
    </div>
  );
}

Drawer.propTypes = {
  header: PropTypes.node.isRequired,
  footer: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
  })).isRequired,
  onItemClick: PropTypes.func.isRequired,
};

class Sidebar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { active, setActiveItem, items } = this.props;

    return (
      <div className={styles.sidebar}>
        <ul className={styles.sidebarIcons}>
          {items.map(({ id, icon, primary, tooltip }) => (
            <SidebarButton
              key={id}
              onClick={() => active === id ? setActiveItem(null) : setActiveItem(id)}
              active={active === id}
              icon={icon}
              primary={primary}
              tooltip={tooltip}
            />
          ))}
        </ul>
        {active ? items.find((item) => item.id === active).component : null}
      </div>
    );
  }
}

Sidebar.propTypes = {
  active: PropTypes.string,
  setActiveItem: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    icon: PropTypes.node,
    component: PropTypes.node,
    primary: PropTypes.bool,
    tooltip: PropTypes.string,
  })),
};

Sidebar.defaultProps = {
  items: [],
  active: null,
  setActiveItem: () => null,
};

export default Sidebar;
