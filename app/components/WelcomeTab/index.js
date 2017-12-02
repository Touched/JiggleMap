/**
*
* WelcomeTab
*
*/

import React from 'react';
import { FormattedMessage } from 'react-intl';
import EmoticonHappyIcon from 'mdi-react/EmoticonHappyIcon';

import messages from './messages';
import styles from './styles.scss';

function WelcomeTab() {
  return (
    <div className={styles.weclomeTab}>
      <EmoticonHappyIcon className={styles.icon} />
      <h1>
        <FormattedMessage {...messages.header} />
      </h1>
    </div>
  );
}

WelcomeTab.propTypes = {

};

export default WelcomeTab;
