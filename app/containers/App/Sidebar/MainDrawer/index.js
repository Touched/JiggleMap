import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { loadProject } from 'containers/App/actions';

export class MainDrawer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    loadProject: PropTypes.func,
  };

  render() {
    return (
      <ul>
        <li><button onClick={this.props.loadProject}>Open Project</button></li>
        <li>Save Project</li>
        <li>Import Project from a ROM</li>
      </ul>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    loadProject(item) {
      dispatch(loadProject(item));
    },
  };
}

export default connect(null, mapDispatchToProps)(MainDrawer);
