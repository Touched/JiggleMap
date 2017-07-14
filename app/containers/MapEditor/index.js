/*
 *
 * MapEditor
 *
 */

import React from 'react';
import { createStructuredSelector } from 'reselect';

import { GridArea, GBATilemap, Renderer } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import {
  selectMapDimensions,
  makeSelectMapPalette,
  makeSelectMapTileset,
  makeSelectMapTilemap,
} from './selectors';
import { editMap } from './actions';

export class MapEditor extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    palette: Uint8Array,
    tileset: Uint8Array,
    tilemap: Uint8Array,
    editMap: Function,
    dimensions: [number, number],
  }

  render() {
    const z = 0.5;
    const { dimensions: [width, height] } = this.props;

    return (
      <div>
        <Renderer
          x={0}
          y={0}
          z={z}
          width={512}
          height={512}
          near={0.25}
          far={2}
        >
          <GBATilemap
            x={0}
            y={0}
            z={0}
            width={width * 16}
            height={height * 16}
            tileset={this.props.tileset}
            tilemap={this.props.tilemap[0]}
            palette={this.props.palette}
            transparent
          />
          <GBATilemap
            x={0}
            y={0}
            z={0}
            width={width * 16}
            height={height * 16}
            tileset={this.props.tileset}
            tilemap={this.props.tilemap[1]}
            palette={this.props.palette}
            transparent
          />
          <GridArea
            x={0}
            y={0}
            width={width * 16}
            height={height * 16}
            onMouseMove={this.props.editMap}
          />
        </Renderer>
      </div>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: selectMapDimensions(),
  palette: makeSelectMapPalette(),
  tileset: makeSelectMapTileset(),
  tilemap: makeSelectMapTilemap(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    editMap(start, end, modifiers) {
      tabDispatch(editMap(start, end, modifiers));
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(MapEditor);
