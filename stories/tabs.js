import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { EditorTabsBar } from 'containers/EditorTabs/EditorTabsBar';
import Sidebar, { Drawer } from 'components/Sidebar';

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

const header = (
  <div className="pt-input-group">
    <span className="pt-icon pt-icon-search"></span>
    <input className="pt-input" type="search" placeholder="Search for Alerts&hellip;" dir="auto" />
  </div>
);

const footer = (
  <div className="pt-button-group">
    <div className="pt-button pt-intent-success pt-icon-plus">New</div>
  </div>
);

const items = [{
  id: 'foo',
  name: 'Test',
  description: 'Hello',
}, {
  id: 'bar',
  name: 'Test',
  description: 'Hello',
}];

const sidebarItems = [{
  id: 'heading',
  icon: 'database',
  primary: true,
  component: <div>Hello</div>,
  tooltip: 'Main',
}, {
  id: 'main',
  icon: 'warning-sign',
  component: <Drawer header={header} footer={footer} items={items} onItemClick={action('clickedItem')} />,
  tooltip: 'Warnings',
}, {
  id: 'item2',
  icon: 'people',
  component: <div>Hello</div>,
  tooltip: 'People',
}];

storiesOf('Sidebar', module)
  .add('normal', () => (
    <div style={{ width: 400 }}>
      <Sidebar items={sidebarItems} active="main" />
    </div>
  ));
