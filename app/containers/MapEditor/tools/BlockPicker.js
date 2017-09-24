import React from 'react';
import BlockPalette from './BlockPalette';

type Props = {
  currentBlock: number;
  onChange: Function;
};

type SelectedTile = {
  block: ?number;
  image: string;
};

type State = {
  currentTile: SelectedTile;
  tileHistory: Array<SelectedTile>;
};

const HISTORY_SIZE = 7;

export function appendToHistory(history, item) {
  return item.block === null ? history : [item, ...history].slice(0, HISTORY_SIZE - 1);
}

export function Tile({ size, image, onClick }: { size: number, image: string, onClick: ?Function }) {
  return (
    <img // eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
      alt="Selected Block"
      src={image}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
      onClick={onClick}
    />
  );
}

export default class BlockPicker extends React.PureComponent<*, Props, State> { // eslint-disable-line react/prefer-stateless-function
  constructor(props: Props) {
    super(props);

    this.state = {
      currentTile: {
        block: null,
        image: '',
      },
      tileHistory: [],
    };
  }

  state: State;
  props: Props;

  handleChange = (block: number, dataURL: string) => {
    this.setState((state) => ({
      ...state,
      currentTile: {
        block,
        image: dataURL,
      },
      tileHistory: appendToHistory(state.tileHistory, state.currentTile),
    }));

    this.props.onChange(block);
  };

  handleRecentBlockSelected = (historyIndex: number) => {
    this.setState((state) => ({
      ...state,
      currentTile: state.tileHistory[historyIndex],
      tileHistory: appendToHistory(state.tileHistory, state.currentTile),
    }));
  };

  render() {
    return (
      <div>
        <Tile size={64} image={this.state.currentTile.image} />
        {this.state.tileHistory.map(({ block, image }, i) => (
          <Tile key={i} size={32} image={image} onClick={() => this.handleRecentBlockSelected(i)} /> // eslint-disable-line react/no-array-index-key
        ))}
        <BlockPalette value={this.props.currentBlock} onChange={this.handleChange} />
      </div>
    );
  }
}
