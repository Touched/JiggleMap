/* @flow */

import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Renderer } from 'components/Renderer';
import { calculateBoundingRectangle } from 'components/Renderer/utils';
import connectTab from 'containers/EditorTabs/connectTab';

import BlockPalette from 'components/BlockPalette';
import Map from 'components/Map';
import {
  makeSelectMainMapBlocksets,
} from '../selectors/mapSelectors';

import './styles.scss';

type MapPreviewProps = {
  width: number;
  height: number;
  zoom: number;
  blocksets: Object;
  map: Object;
  children: React.Node;
};

/* eslint-disable react/no-unused-prop-types */
type AutoBlock = {
  nw: number;
  n: number;
  ne: number;
  w: number;
  c: number;
  e: number;
  sw: number;
  s: number;
  se: number;
  inw: number;
  ine: number;
  isw: number;
  ise: number;
  g: number;
  enableLayering: boolean;
};
/* eslint-enable */

function MapPreview({ width, height, zoom, blocksets, map, children }: MapPreviewProps) {
  const { left, top } = calculateBoundingRectangle(0, 0, 16 * width, 16 * height, 0, 0);

  return (
    <Renderer
      x={left}
      y={top}
      zoom={zoom}
      width={16 * zoom * width}
      height={16 * zoom * height}
      zoomMin={0.1}
      zoomMax={zoom}
    >
      <Map
        width={width}
        height={height}
        blocksets={blocksets}
        map={map}
      />
      {children}
    </Renderer>
  );
}

const positionToAutoBlockPiece = [
  'nw', 'n', 'ne', 'g', null, 'w', 'c', 'e', 'inw', 'ine', 'sw', 's', 'se', 'isw', 'ise',
];

export class AutoBlockCreator extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      selectedPosition: 6,
    };
  }

  props: {
    blocksets: Object;
    onChangeAutoBlock: (string, number) => void;
    autoBlock: AutoBlock;
  }

  handleAutoBlockModifyBlockIndex = ({ x, y }) => {
    const blockIndex = (y * 8) + x;
    this.props.onChangeAutoBlock(positionToAutoBlockPiece[this.state.selectedPosition], blockIndex);
  };

  handleAutoBlockModifyBlockPosition = ({ x, y }) => {
    const blockPosition = (5 * y) + x;

    if (positionToAutoBlockPiece[blockPosition]) {
      this.setState((state) => ({
        ...state,
        selectedPosition: blockPosition,
      }));
    }
  };

  render() {
    const preview = {
      block: buildAutoBlockPreview(this.props.autoBlock),
    };

    const configuration = {
      block: buildAutoBlockEditor(this.props.autoBlock),
    };

    const { primary, secondary } = this.props.blocksets;
    const blockCount = primary.blocks.length + secondary.blocks.length;
    const palette = {
      block: [...new Array(blockCount)].map((x, index) => index),
    };

    return (
      <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
        <div>Preview</div>
        <MapPreview
          width={10}
          height={5}
          zoom={1}
          blocksets={this.props.blocksets}
          map={preview}
        >
        </MapPreview>

        <div>Configuration</div>
        <BlockPalette
          width={5}
          height={3}
          zoom={2}
          blocksets={this.props.blocksets}
          map={configuration}
          value={this.state.selectedPosition}
          onChange={(blockPosition) => this.handleAutoBlockModifyBlockPosition(blockPosition)}
        />

        <div>Blocks</div>
        <BlockPalette
          width={8}
          className="BlockPalette"
          height={blockCount / 8}
          onChange={(blockIndex) => this.handleAutoBlockModifyBlockIndex(blockIndex)}
          blocksets={this.props.blocksets}
          map={palette}
          value={this.props.autoBlock[positionToAutoBlockPiece[this.state.selectedPosition]]}
        />
      </div>
    );
  }
}

function buildAutoBlockEditor({ n, s, e, w, ne, se, nw, sw, c, g, ise, isw, ine, inw }) {
  return [
    nw, n, ne, g, 0,
    w, c, e, inw, ine,
    sw, s, se, isw, ise,
  ];
}

function buildAutoBlockPreview({ n, s, e, w, ne, se, nw, sw, c, g, ise, isw, ine, inw, enableLayering }) {
  return enableLayering ? [
    nw, n, n, n, ne, inw, s, s, s, ine,
    w, nw, n, ne, e, e, inw, s, ine, w,
    w, w, c, e, e, e, e, g, w, w,
    w, sw, s, se, e, e, isw, n, ise, w,
    sw, s, s, s, se, isw, n, n, n, ise,
  ] : [
    nw, n, n, n, ne, inw, s, s, s, ine,
    w, c, c, c, e, e, g, g, g, w,
    w, c, c, c, e, e, g, g, g, w,
    w, c, c, c, e, e, g, g, g, w,
    sw, s, s, s, se, isw, n, n, n, ise,
  ];
}

const mapTabStateToProps = createStructuredSelector({
  blocksets: makeSelectMainMapBlocksets(),
});

export default connectTab(null, mapTabStateToProps, null, null)(AutoBlockCreator);
