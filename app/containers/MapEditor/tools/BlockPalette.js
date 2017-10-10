import React from 'react';
import invariant from 'invariant';

import { Renderer, Box, HTML3D } from 'components/Renderer';
import { calculateBoundingRectangle } from 'components/Renderer/utils';

import Map from '../Content/Map';

const BLOCK_SIZE = 16;

export default class BlockPalette extends React.Component {
  static defaultProps = {
    zoom: 2,
    minWidth: 1,
    maxWidth: Infinity,
    minHeight: 1,
    maxHeight: Infinity,
    multiselect: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      selecting: false,
    };
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  getSelectionMinMax() {
    if (this.props.multiselect) {
      const { minWidth, minHeight, maxWidth, maxHeight } = this.props;

      invariant(minWidth <= maxWidth, 'The minimum selection width must be smaller or equal to the maximum');
      invariant(minHeight <= maxHeight, 'The minimum selection height must be smaller or equal to the maximum');
      invariant(minWidth > 0, 'The minimum selection width must be at least 1');
      invariant(minHeight > 0, 'The minimum selection height must be at least 1');

      return {
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
      };
    }

    return {
      minWidth: 1,
      maxWidth: 1,
      minHeight: 1,
      maxHeight: 1,
    };
  }

  getBoundingBox() {
    if (this.props.value && !this.state.selecting) {
      return this.props.value;
    }

    const { x: x1, y: y1 } = this.state.start;
    const { x: x2, y: y2 } = this.state.end;
    const { maxWidth, minWidth, maxHeight, minHeight } = this.getSelectionMinMax();

    const width = Math.max(Math.min(Math.abs(x2 - x1), maxWidth), minWidth);
    const height = Math.max(Math.min(Math.abs(y2 - y1), maxHeight), minHeight);

    const minX = Math.max(x1, x2) - width;
    const minY = Math.max(y1, y2) - height;

    return {
      x: x1 > x2 ? minX : x1,
      y: y1 > y2 ? minY : y1,
      width,
      height,
    };
  }

  handleMouseDown = ({ nativeEvent }: MouseEvent) => {
    const x = Math.floor(nativeEvent.offsetX / BLOCK_SIZE);
    const y = Math.floor(nativeEvent.offsetY / BLOCK_SIZE);

    this.setState((state) => ({
      ...state,
      start: { x, y },
      end: { x: x + 1, y: y + 1 },
      selecting: true,
    }));
  };

  handleMouseMove = (nativeEvent: MouseEvent) => {
    if (this.state.selecting && this.props.multiselect) {
      const x = Math.floor(nativeEvent.offsetX / BLOCK_SIZE);
      const y = Math.floor(nativeEvent.offsetY / BLOCK_SIZE);

      this.setState((state) => ({
        ...state,
        end: { x, y },
      }));
    }
  };

  handleMouseUp = () => {
    if (this.props.onChange) {
      const box = this.getBoundingBox();
      const clampedBox = {
        x: Math.max(box.x, 0),
        y: Math.max(box.y, 0),
        width: Math.min(box.width + box.x, this.props.width - 1) - box.x,
        height: Math.min(box.height + box.y, this.props.height - 1) - box.y,
      };

      // Don't report selections that are too small
      if (clampedBox.width >= this.props.minWidth && clampedBox.height >= this.props.minHeight) {
        this.props.onChange(clampedBox);
      }
    }

    this.setState((state) => ({
      ...state,
      selecting: false,
    }));
  };

  props: {
    palette: Uint8Array;
    tileset: Uint8Array;
    tilemaps: Array<Uint8Array>;
    zoom: number;
    onChange: (value) => void;
    value: {
      x: number; // eslint-disable-line react/no-unused-prop-types
      y: number; // eslint-disable-line react/no-unused-prop-types
      width: number;
      height: number;
    };
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    width: number;
    height: number;
    multiselect: boolean;
    className: string;
  };
  canvas: HtmlCanvasElement;

  render() {
    const { tileset, palette, tilemaps, zoom, width, height, value } = this.props;

    const objectWidth = width * BLOCK_SIZE;
    const objectHeight = height * BLOCK_SIZE;
    const containerWidth = objectWidth * zoom;
    const containerHeight = objectHeight * zoom;
    const { left, top } = calculateBoundingRectangle(0, 0, objectWidth, objectHeight, 0, 0);

    const style = {
      width: containerWidth,
      height: containerHeight,
      cursor: 'pointer',
    };

    const box = this.getBoundingBox();

    // TODO: Grid
    return (
      <Renderer
        x={left}
        y={top}
        zoom={zoom}
        width={containerWidth}
        height={containerHeight}
        zoomMin={0.25}
        zoomMax={2}
        className={this.props.className}
      >
        <Map
          width={width}
          height={height}
          tileset={tileset}
          tilemaps={tilemaps}
          palette={palette}
        />
        {(value || this.state.selecting) && <Box
          color="#ff0000"
          x={BLOCK_SIZE * box.x}
          y={BLOCK_SIZE * box.y}
          width={BLOCK_SIZE * box.width}
          height={BLOCK_SIZE * box.height}
        />}
        <HTML3D width={containerWidth} height={containerHeight}>
          <div // eslint-disable-line jsx-a11y/no-static-element-interactions
            onMouseDown={this.handleMouseDown}
            style={style}
          />
        </HTML3D>
      </Renderer>
    );
  }
}
