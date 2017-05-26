/*
 *
 * MapEditor
 *
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';

import connectTab from 'containers/EditorTabs/connectTab';
import messages from './messages';

export class MapEditor extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <FormattedMessage {...messages.header} />
      </div>
    );
  }
}

MapEditor.propTypes = {
};

const mapTabStateToProps = createStructuredSelector({
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    tabDispatch,
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(MapEditor);
