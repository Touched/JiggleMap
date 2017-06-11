/*
 *
 * MapEditor
 *
 */

import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Area, GBATilemap, Renderer } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import { makeSelectMapPalette, makeSelectMapTileset, makeSelectMapTilemap } from './selectors';

export class MapEditor extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    palette: Uint8Array,
    tileset: Uint8Array,
    tilemap: Uint8Array,
  }

  render() {
    return (
      <div>
        <Renderer
          x={0}
          y={0}
          z={0.5}
          width={512}
          height={512}
          near={0.25}
          far={2}
        >
          <GBATilemap
            x={0}
            y={0}
            z={0}
            width={11 * 16}
            height={17 * 16}
            tileset={this.props.tileset}
            tilemap={this.props.tilemap[0]}
            palette={this.props.palette}
            transparent
          />
          <GBATilemap
            x={0}
            y={0}
            z={0}
            width={11 * 16}
            height={17 * 16}
            tileset={this.props.tileset}
            tilemap={this.props.tilemap[1]}
            palette={this.props.palette}
            transparent
          />
          <Area
            x={0}
            y={0}
            width={11 * 16}
            height={17 * 16}
            onMouseMove={console.log}
          />
        </Renderer>
      </div>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  palette: makeSelectMapPalette(),
  tileset: makeSelectMapTileset(),
  tilemap: makeSelectMapTilemap(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    tabDispatch,
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(MapEditor);
