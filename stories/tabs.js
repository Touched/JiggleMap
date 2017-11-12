import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { EditorTabsBar } from 'containers/EditorTabs/EditorTabsBar';

import 'sanitize.css/sanitize.css';
import '@blueprintjs/core/dist/blueprint.css';

const tabs = [{
  id: 1,
  title: 'Tab 1',
  dirty: true,
}, {
  id: 2,
  title: 'Tab 2',
}];

storiesOf('Tabs', module)
  .add('with tabs', () => (
    <EditorTabsBar
      onNewTab={action('newTab')}
      onCloseTab={action('closeTab')}
      onSwitchTab={action('switchTab')}
      onReorder={action('reorderTab')}
      tabs={tabs}
      activeTab={2}
    />
  ));
