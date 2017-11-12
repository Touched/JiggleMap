import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { Drawer } from 'components/Sidebar';
import { loadTab } from 'containers/EditorTabs/actions';

import { makeSelectResources } from 'containers/App/selectors';

function ResourceLink({ resource, onClick }) {
  return (
    <button onClick={() => onClick(resource)}>
      <div>{resource.icon}</div>
      <div>{resource.id}</div> {/* Display id muted */}
      <div>{resource.name}</div>
      <div>{resource.description}</div>
    </button>
  );
}

ResourceLink.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    icon: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
};

ResourceLink.defaultProps = {
  id: '',
  type: '',
  icon: null,
  name: '',
  description: '',
  onClick: null,
};

export class ResourceDrawer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    resources: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      icon: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
    })),
    openResource: PropTypes.func,
  };

  static defaultProps = {
    resources: [],
    openResource: null,
  };

  render() {
    // return (
    //   <ul>
    //     {this.props.resources.map((resource) => (
    //       <li key={resource.id}>
    //         <ResourceLink resource={resource} onClick={this.props.openResource} />
    //       </li>
    //     ))}
    //   </ul>
    // );

    const header = (
      <div className="pt-input-group">
        <span className="pt-icon pt-icon-search"></span>
        <input className="pt-input" type="search" placeholder="Search&hellip;" dir="auto" />
      </div>
    );

    const footer = (
      <div className="pt-button-group">
        <div className="pt-button pt-intent-success pt-icon-plus">New</div>
      </div>
    );

    const onClick = (id) => {
      const resource = this.props.resources.find((r) => r.id === id);
      this.props.openResource(resource);
    };

    return <Drawer header={header} footer={footer} items={this.props.resources} onItemClick={onClick} />;
  }
}

const mapStateToProps = (state, { type }) => createStructuredSelector({
  resources: makeSelectResources(type),
})(state);

function mapDispatchToProps(dispatch) {
  return {
    openResource({ id, type, name }) {
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

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDrawer);
