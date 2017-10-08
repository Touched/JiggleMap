import React from 'react';
import * as THREE from 'three';
import { nativeImage } from 'electron';

import { Renderer, Box, HTML3D } from 'components/Renderer';
import { calculateBoundingRectangle } from 'components/Renderer/utils';

import Map from '../Content/Map';

const BLOCK_SIZE = 16;

export default class BlockPalette extends React.Component {
  static defaultProps = {
    zoom: 2,
    value: 0,
  };

  getBlockImage(block: number) {
    const { width, height, zoom } = this.props;
    const blockCount = width * height;

    if (block >= blockCount) {
      return null;
    }

    const blockSize = BLOCK_SIZE * zoom;
    const blockX = block % width;
    const blockY = Math.floor(block / width);

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
    const block = (y * this.props.width) + x;

    if (this.props.onChange) {
      this.props.onChange(block, this.getBlockImage(block).toDataURL());
    }
  };

  render() {
    const { tileset, palette, tilemap, zoom, width, height, value } = this.props;

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
        customRenderer={this.customRenderer}
        canvasRef={(ref) => { this.canvas = ref; }}
        className={this.props.className}
      >
        <Map
          width={width}
          height={height}
          tileset={tileset}
          tilemaps={tilemap}
          palette={palette}
        />
        <Box
          color="#ff0000"
          x={16 * (value % width)}
          y={16 * Math.floor(value / width)}
          width={16}
          height={16}
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
