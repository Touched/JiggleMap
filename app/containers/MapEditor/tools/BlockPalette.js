import React from 'react';
import * as THREE from 'three';
import { createStructuredSelector } from 'reselect';
import { nativeImage } from 'electron';

import { Renderer, HTML3D } from 'components/Renderer';
import { calculateBoundingRectangle } from 'components/Renderer/utils';
import connectTab from 'containers/EditorTabs/connectTab';

import Map from '../Map';
import {
  makeSelectMainMapPalette,
  makeSelectMainMapTileset,
  makeSelectMainMapTilemaps,
  makeSelectMainMapBlockset,
} from '../selectors';

const BLOCK_SIZE = 16;
const WIDTH_IN_BLOCKS = 8;

export class BlockPalette extends React.Component {
  static defaultProps = {
    zoom: 2,
  };

  getBlockImage(block: number) {
    const { blocks, zoom } = this.props;
    const blockCount = blocks[0].length / 16;

    if (block >= blockCount) {
      return null;
    }

    const blockSize = BLOCK_SIZE * zoom;
    const blockX = block % WIDTH_IN_BLOCKS;
    const blockY = Math.floor(block / WIDTH_IN_BLOCKS);

    const gl = this.renderer.context;
    const buffer = new Uint8Array(blockSize * blockSize * 4);
    gl.readPixels(
      blockX * blockSize,
      gl.drawingBufferHeight - ((blockY + 1) * blockSize),
      blockSize,
      blockSize,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      buffer,
    );

    // The pixels read from the WebGL buffer are vertically flipped and in BGRA
    // and need to be flipped and converted.
    const bufferConverted = new Uint8Array(blockSize * blockSize * 4);
    for (let y = 0; y < blockSize; y++) { // eslint-disable-line no-plusplus
      for (let x = 0; x < blockSize; x++) { // eslint-disable-line no-plusplus
        const i = ((y * blockSize) + x) * 4;
        const j = (((blockSize - y - 1) * blockSize) + x) * 4;
        bufferConverted[i] = buffer[j + 2];
        bufferConverted[i + 1] = buffer[j + 1];
        bufferConverted[i + 2] = buffer[j];
        bufferConverted[i + 3] = buffer[j + 3];
      }
    }

    const image = nativeImage.createFromBuffer(bufferConverted, {
      width: blockSize,
      height: blockSize,
    });

    return image.resize({ width: BLOCK_SIZE, height: BLOCK_SIZE });
  }

  props: {
    palette: Uint8Array;
    tileset: Uint8Array;
    blocks: Array<Uint8Array>;
    zoom: number;
    onChange: (value) => void,
  };
  canvas: HtmlCanvasElement;

  customRenderer = (rendererArgs) => {
    this.renderer = new THREE.WebGLRenderer({
      ...rendererArgs,
      preserveDrawingBuffer: true,
    });

    const originalRender = this.renderer.render.bind(this.renderer);
    let intialUpdateCompleted = false;

    this.renderer.render = (...args) => {
      originalRender(...args);

      // Set the initial image
      if (!intialUpdateCompleted) {
        const block = this.props.value;
        const image = this.getBlockImage(block);

        if (image && this.props.onChange) {
          this.props.onChange(block, image.toDataURL());
          intialUpdateCompleted = true;
        }
      }
    };

    return this.renderer;
  };

  handleClick = ({ nativeEvent }: MouseEvent) => {
    const x = Math.floor(nativeEvent.offsetX / BLOCK_SIZE);
    const y = Math.floor(nativeEvent.offsetY / BLOCK_SIZE);
    const block = (y * WIDTH_IN_BLOCKS) + x;

    if (this.props.onChange) {
      this.props.onChange(block, this.getBlockImage(block).toDataURL());
    }
  };

  render() {
    const { tileset, palette, blocks, zoom } = this.props;
    const blockCount = blocks[0].length / 16;

    const width = WIDTH_IN_BLOCKS;
    const height = blockCount / width;

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
        customRenderer={this.customRenderer}
        canvasRef={(ref) => { this.canvas = ref; }}
      >
        <Map
          width={width}
          height={height}
          tileset={tileset}
          tilemaps={blocks}
          palette={palette}
        />
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

const mapTabStateToProps = createStructuredSelector({
  palette: makeSelectMainMapPalette(),
  tileset: makeSelectMainMapTileset(),
  tilemaps: makeSelectMainMapTilemaps(),
  blocks: makeSelectMainMapBlockset(),
});

export default connectTab(null, mapTabStateToProps, null, null)(BlockPalette);
