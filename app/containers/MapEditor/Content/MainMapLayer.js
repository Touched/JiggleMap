import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group, GridArea } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from '../Map';

import {
  makeSelectMainMapDimensions,
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectToolState,
} from '../selectors';
import { editMap, commitMapEdit } from '../actions';

export class MainMapLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    palette: Uint8Array,
    tileset: Uint8Array,
    tilemaps: Array<Uint8Array>,
    editMap: Function,
    commitMapEdit: Function,
    dimensions: [number, number],
    toolState: Object,
  }

  handleMouseMove = (start, end, event) => {
    this.props.editMap(this.props.toolState, start, end, event);
    event.stopPropagation();
  };

  handleMouseUp = (start, end, event) => {
    this.props.commitMapEdit();
    event.stopPropagation();
  };

  render() {
    const { dimensions: [width, height] } = this.props;

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
        />
        <GridArea
          x={0}
          y={0}
          width={width}
          height={height}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          bounded
        />
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  dimensions: makeSelectMainMapDimensions(),
  palette: makeSelectMainMapPalette(),
  tileset: makeSelectMainMapTileset(),
  tilemaps: makeSelectMainMapTilemaps(),
  toolState: makeSelectToolState(),
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
