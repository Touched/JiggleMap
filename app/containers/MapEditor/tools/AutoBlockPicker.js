import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Renderer, HTML3D } from 'components/Renderer';
import { calculateBoundingRectangle } from 'components/Renderer/utils';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from 'components/Map';
import {
  makeSelectMainMapBlocksets,
} from '../selectors/mapSelectors';

const BLOCK_SIZE = 16;

export class AutoBlockPicker extends React.PureComponent<Props, State> { // eslint-disable-line react/prefer-stateless-function
  static defaultProps = {
    zoom: 2,
  };

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

  handleChange = (block: number, dataURL: string) => {
    this.setState((state) => ({
      ...state,
      currentTile: {
        block,
        image: dataURL,
      },
    }));

    this.props.onChange(block);
  };

  render() {
    const { blocksets, zoom, autoBlocks } = this.props;

    const width = 3;
    const height = autoBlocks.length * 4;
    const objectWidth = width * BLOCK_SIZE;
    const objectHeight = height * BLOCK_SIZE;
    const containerWidth = objectWidth * zoom;
    const containerHeight = objectHeight * zoom;

    const { left, top } = calculateBoundingRectangle(
      containerWidth,
      containerHeight,
      objectWidth,
      objectHeight,
      0,
      0,
    );

    const style = {
      width: containerWidth,
      height: containerHeight,
      cursor: 'pointer',
    };

    return (
      <Renderer
        x={left}
        y={top}
        zoom={zoom}
        width={containerWidth}
        height={containerHeight}
        zoomMin={0.25}
        zoomMax={2}
      >
        {autoBlocks.map((autoBlock, i) => (
          <Map
            width={3}
            height={3}
            y={(3 * i) + i}
            blocksets={blocksets}
            map={buildAutoBlock(autoBlock)}
          />
        ))}
        <HTML3D width={containerWidth} height={containerHeight}>
          <div // eslint-disable-line jsx-a11y/no-static-element-interactions
            onClick={this.handleClick}
            style={style}
          />
        </HTML3D>
      </Renderer>
    );
  }
}

function buildAutoBlock(autoBlock) {
  return [
    autoBlock.nw, autoBlock.n, autoBlock.ne,
    autoBlock.w, autoBlock.c, autoBlock.e,
    autoBlock.sw, autoBlock.s, autoBlock.se,
  ];
}

const mapTabStateToProps = createStructuredSelector({
  blocksets: makeSelectMainMapBlocksets(),
});

export default connectTab(null, mapTabStateToProps, null, null)(AutoBlockPicker);
