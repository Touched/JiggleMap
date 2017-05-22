import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { makeSelectEntities } from 'containers/App/selectors';

function EntityLink({ type, id, icon, name, description }) {
  return (
    <Link to={`${type}/${id}`}>
      <div>{icon}</div>
      <div>{id}</div> {/* Display id muted */}
      <div>{name}</div>
      <div>{description}</div>
    </Link>
  );
}

EntityLink.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  icon: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
};

export class EntityDrawer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    entities: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      icon: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
    })),
  };

  render() {
    return (
      <ul>
        {this.props.entities.map((entity) => <li key={entity.id}><EntityLink {...entity} /></li>)}
      </ul>
    );
  }
}

const mapStateToProps = (state, { type }) => createStructuredSelector({
  entities: makeSelectEntities(type),
})(state);

export default connect(mapStateToProps, null)(EntityDrawer);
