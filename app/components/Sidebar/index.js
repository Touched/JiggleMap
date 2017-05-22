/**
*
* Sidebar
*
*/

import React, { PropTypes } from 'react';
// import styled from 'styled-components';

function SidebarButton({ onClick, active, icon }) {
  return (
    <li>
      <button onClick={onClick}>{active ? '*' : ''}{icon}</button>
    </li>
  );
}

SidebarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  icon: PropTypes.node,
};

class Sidebar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { active, setActiveItem, items } = this.props;

    return (
      <div>
        <ul>
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
};

export default Sidebar;
