/* @flow */

import React from 'react';
import { createStructuredSelector } from 'reselect';

import connectTab from 'containers/EditorTabs/connectTab';

import BlockPalette from './BlockPalette';
import {
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectMainMapBlockset,
} from '../selectors/mapSelectors';

type Props = {
  currentBlock: number;
  onChange: Function;
  tileset: Uint8Array;
  palette: Uint8Array;
  blocks: Array<Uint8Array>;
};

type State = {
  currentTile: number;
};

export class BlockPicker extends React.PureComponent<*, Props, State> { // eslint-disable-line react/prefer-stateless-function
  constructor(props: Props) {
    super(props);

    this.state = {
      currentTile: {
        block: null,
        image: '',
      },
    };
  }

  state: State;
  props: Props;

  handleChange = ({ x, y }) => {
    const block = (y * 8) + x;
    this.setState((state) => ({
      ...state,
      currentTile: block,
    }));

    this.props.onChange(block);
  };

  handleRecentBlockSelected = (historyIndex: number) => {
    this.setState((state) => ({
      ...state,
      currentTile: state.tileHistory[historyIndex],
    }));
  };

  render() {
    const x = this.props.currentBlock % 8;
    const y = Math.floor(this.props.currentBlock / 8);

    return (
      <div>
        <BlockPalette
          width={8}
          height={this.props.blocks[0].length / 16 / 8}
          value={{ x, y }}
          onChange={this.handleChange}
          tileset={this.props.tileset}
          palette={this.props.palette}
          tilemaps={this.props.blocks}
        />
      </div>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  palette: makeSelectMainMapPalette(),
  tileset: makeSelectMainMapTileset(),
  tilemaps: makeSelectMainMapTilemaps(),
  blocks: makeSelectMainMapBlockset(),
});

export default connectTab(null, mapTabStateToProps, null, null)(BlockPicker);
