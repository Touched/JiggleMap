/* @flow */

import React from 'react';
import { createStructuredSelector } from 'reselect';

import connectTab from 'containers/EditorTabs/connectTab';

import BlockPalette from 'components/BlockPalette';
import {
  makeSelectMainMapBlocksets,
} from '../selectors/mapSelectors';

type Props = {
  currentBlock: number;
  onChange: Function;
  blocksets: Object;
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

    const { primary, secondary } = this.props.blocksets;
    const blockCount = primary.blocks.length + secondary.blocks.length;

    const map = {
      block: [...new Array(blockCount)].map((_, index) => index),
    };

    return (
      <div>
        <BlockPalette
          width={8}
          height={blockCount / 8}
          value={{ x, y }}
          onChange={this.handleChange}
          blocksets={this.props.blocksets}
          map={map}
        />
      </div>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  blocksets: makeSelectMainMapBlocksets(),
});

export default connectTab(null, mapTabStateToProps, null, null)(BlockPicker);
