import React from 'react';
import * as THREE from 'three';
import { Renderer } from 'components/Renderer';
import { calculateBoundingRectangle } from 'components/Renderer/utils';
import { nativeImage } from 'electron';

import Map from './Map';

const BLOCK_SIZE = 16;
const WIDTH_IN_BLOCKS = 8;

export default class BlockPicker extends React.Component {
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
  };
  canvas: HtmlCanvasElement;

  customRenderer = (rendererArgs) => {
    this.renderer = new THREE.WebGLRenderer({
      ...rendererArgs,
      preserveDrawingBuffer: true,
    });

    return this.renderer;
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

    return (
      <Renderer
        x={left}
        y={top}
        z={1 / zoom}
        width={containerWidth}
        height={containerHeight}
        near={0.25}
        far={2}
        customRenderer={this.customRenderer}
        canvasRef={(ref) => { this.canvas = ref; }}
        onMouseDown={() => console.log(this.getBlockImage(4).toDataURL())}
      >
        <Map
          width={width}
          height={height}
          tileset={tileset}
          tilemaps={blocks}
          palette={palette}
        />
      </Renderer>
    );
  }
}
