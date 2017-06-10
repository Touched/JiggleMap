/**
*
* NewTab
*
*/

import React from 'react';
import { FormattedMessage } from 'react-intl';
import TabIcon from 'mdi-react/TabIcon';

import messages from './messages';
import './styles.scss';

function NewTab() {
  return (
    <div className="NewTab">
      <TabIcon className="NewTab__icon" />
      <h1>
        <FormattedMessage {...messages.header} />
      </h1>
    </div>
  );
}

NewTab.propTypes = {

};

export default NewTab;
