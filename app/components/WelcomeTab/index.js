/**
*
* WelcomeTab
*
*/

import React from 'react';
import { FormattedMessage } from 'react-intl';
import EmoticonHappyIcon from 'mdi-react/EmoticonHappyIcon';

import messages from './messages';
import './styles.scss';

function WelcomeTab() {
  return (
    <div className="WelcomeTab">
      <EmoticonHappyIcon className="WelcomeTab__icon" />
      <h1>
        <FormattedMessage {...messages.header} />
      </h1>
    </div>
  );
}

WelcomeTab.propTypes = {

};

export default WelcomeTab;
