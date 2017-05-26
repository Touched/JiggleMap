import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { loadTab } from 'containers/EditorTabs/actions';

import { makeSelectEntities } from 'containers/App/selectors';

function EntityLink({ entity, onClick }) {
  return (
    <button onClick={() => onClick(entity)}>
      <div>{entity.icon}</div>
      <div>{entity.id}</div> {/* Display id muted */}
      <div>{entity.name}</div>
      <div>{entity.description}</div>
    </button>
  );
}

EntityLink.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    icon: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
};

EntityLink.defaultProps = {
  id: '',
  type: '',
  icon: null,
  name: '',
  description: '',
  onClick: null,
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
    openEntity: PropTypes.func,
  };

  static defaultProps = {
    entities: [],
    openEntity: null,
  };

  render() {
    return (
      <ul>
        {this.props.entities.map((entity) => (
          <li key={entity.id}>
            <EntityLink entity={entity} onClick={this.props.openEntity} />
          </li>
        ))}
      </ul>
    );
  }
}

const mapStateToProps = (state, { type }) => createStructuredSelector({
  entities: makeSelectEntities(type),
})(state);

function mapDispatchToProps(dispatch) {
  return {
    openEntity({ id, type, name }) {
      dispatch(loadTab(type, {
        title: name,
        meta: {
          type,
          id,
        },
      }));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityDrawer);
