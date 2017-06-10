/**
*
* Sidebar
*
*/

import React, { PropTypes } from 'react';
import classNames from 'classnames';

import './styles.scss';

function SidebarButton({ onClick, active, icon }) {
  const classes = {
    'Sidebar__item--active': active,
  };

  return (
    <li>
      <button className={classNames('Sidebar__item', classes)} onClick={onClick}>{icon}</button>
    </li>
  );
}

SidebarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  icon: PropTypes.node,
};

SidebarButton.defaultProps = {
  active: false,
  icon: null,
};

class Sidebar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { active, setActiveItem, items } = this.props;

    return (
      <div className="Sidebar">
        <ul className="Sidebar__bar">
          {items.map(({ id, icon }) => (
            <SidebarButton
              key={id}
              onClick={() => active === id ? setActiveItem(null) : setActiveItem(id)}
              active={active === id}
              icon={icon}
            />
          ))}
        </ul>
        {active ? <div>{items.find((item) => item.id === active).component}</div> : null}
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
  })),
};

Sidebar.defaultProps = {
  items: [],
  active: null,
  setActiveItem: () => null,
};

export default Sidebar;
