import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from 'components/Map';

import {
  makeSelectMainMapBlocksets,
  makeSelectMainMapData,
} from '../selectors/mapSelectors';
import { makeSelectActiveLayer } from '../selectors/editingSelectors';
import { editMap, commitMapEdit } from '../actions';
import ToolHitBox from './ToolHitBox';

export class MainMapLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    activeLayer: string;
    map: Object;
    blocksets: Object;
  };

  render() {
    const { activeLayer, map, blocksets } = this.props;

    const [width, height] = map.dimensions;

    return (
      <Group>
        <Map
          x={0}
          y={0}
          z={0}
          width={width}
          height={height}
          map={map}
          blocksets={blocksets}
          showHeightMap={activeLayer === 'height'}
          showCollisionMap={activeLayer === 'collision'}
        />
        <ToolHitBox objectType="main-map" width={width * 16} height={height * 16} object={map} />
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  blocksets: makeSelectMainMapBlocksets(),
  map: makeSelectMainMapData(),
  activeLayer: makeSelectActiveLayer(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    editMap(toolState, start, end, modifiers) {
      tabDispatch(editMap(toolState, start, end, modifiers));
    },
    commitMapEdit() {
      tabDispatch(commitMapEdit());
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(MainMapLayer);
