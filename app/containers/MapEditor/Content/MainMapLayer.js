import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from './Map';

import {
  makeSelectMainMapDimensions,
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectMainMapCollisionMap,
  makeSelectMainMapHeightMap,
  makeSelectMainMapObject,
} from '../selectors/mapSelectors';
import { makeSelectActiveLayer } from '../selectors/editingSelectors';
import { editMap, commitMapEdit } from '../actions';
import ToolHitBox from './ToolHitBox';

export class MainMapLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    palette: Uint8Array,
    tileset: Uint8Array,
    tilemaps: Array<Uint8Array>,
    heightMap: Uint8Array,
    collisionMap: Uint8Array,
    dimensions: [number, number],
    activeLayer: string,
    object: Object,
  }

  render() {
    const { activeLayer, dimensions: [width, height], object } = this.props;

    return (
      <Group>
        <Map
          x={0}
          y={0}
          z={0}
          width={width}
          height={height}
          tileset={this.props.tileset}
          tilemaps={this.props.tilemaps}
          palette={this.props.palette}
          heightMap={activeLayer === 'height' && this.props.heightMap}
          collisionMap={activeLayer === 'collision' && this.props.collisionMap}
        />
        <ToolHitBox objectType="main-map" width={width * 16} height={height * 16} object={object} />
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: makeSelectMainMapDimensions(),
  palette: makeSelectMainMapPalette(),
  tileset: makeSelectMainMapTileset(),
  tilemaps: makeSelectMainMapTilemaps(),
  collisionMap: makeSelectMainMapCollisionMap(),
  heightMap: makeSelectMainMapHeightMap(),
  activeLayer: makeSelectActiveLayer(),
  object: makeSelectMainMapObject(),
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
