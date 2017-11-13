import { configure } from '@storybook/react';

function loadStories() {
  require('../stories');
  require('../stories/tabs');
  require('../stories/mapEditor');
}

configure(loadStories, module);
