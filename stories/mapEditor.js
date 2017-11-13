import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ToolBox from 'containers/MapEditor/ToolBox';
import MapControls from 'containers/MapEditor/MapControls';
import 'containers/MapEditor/styles.scss';

import 'sanitize.css/sanitize.css';
import '@blueprintjs/core/dist/blueprint.css';

storiesOf('MapEditor ToolBox', module)
  .add('map layer', () => (
    <ToolBox
      activeLayer="map"
      selectedTool={{ id: 'pointer-tool' }}
      tabDispatch={action('dispatch')}
    />
  ));

storiesOf('MapEditor MapControls', module)
  .add('without minimap', () => (
    <MapControls
      onToggleLayer={action('toggleLayer')}
      onRecenterClick={action('recenter')}
      onZoomChanged={action('zoomChanged')}
      zoom={1}
      zoomMin={0.25}
      zoomMax={4}
      activeLayer={'height'}
    />
  ));
