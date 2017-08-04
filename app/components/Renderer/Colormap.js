import React from 'react';
import * as THREE from 'three';
import warning from 'warning';

import { containerShape } from './ContainerProvider';
import { calculateBoundingRectangle } from './utils';

const vertexShader = `
varying vec2 textureCoords;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    textureCoords = vec2(uv.x, 1.0 - uv.y);
}
`;

const fragmentShader = `
varying vec2 textureCoords;
uniform sampler2D tilemap;
uniform sampler2D image;
uniform sampler2D palette;
uniform vec2 tileSize;
uniform vec2 sheetSize;
uniform vec2 mapSize;

void main() {
    vec4 currentTile = floor(texture2D(tilemap, textureCoords) * 256.0);
    vec4 color = texture2D(palette, vec2((currentTile.a + 0.5) / 256.0, 0.5));

    if (color.a <= 0.0) {
        discard;
    }

    gl_FragColor = color;
}
`;

function uploadDataToTexture(
  data: Uint8Array,
  width: number,
  height: number,
  format: THREE.RGBAFormat | THREE.AlphaFormat,
  flipY: boolean,
) {
  this.image = { data, width, height };
  this.magFilter = THREE.NearestFilter;
  this.minFilter = THREE.NearestFilter;
  this.url = null;
  this.format = format;
  this.generateMipmaps = false;
  this.isDataTexture = true;
  this.unpackAlignment = 1;
  this.flipY = flipY;
  this.needsUpdate = true;
}

export default class Colormap extends React.PureComponent {
  static contextTypes = {
    container: containerShape,
  };

  static defaultProps = {
    x: 0,
    y: 0,
    z: 0,
    tileWidth: 8,
    tileHeight: 8,
    transparent: false,
    name: '',
    colorFilter: '',
  };

  componentDidMount() {
    this.uploadDataTextures({
      uploadTilemap: true,
      uploadPalette: true,
    });
  }

  componentDidUpdate(prevProps) {
    this.uploadDataTextures({
      uploadTilemap: prevProps.tilemap !== this.props.tilemap,
      uploadPalette: prevProps.palette !== this.props.palette,
    });
  }

  props: {
    tileWidth: number,
    tileHeight: number,
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    palette: Uint8Array,
    tilemap: Uint8Array,
    transparent: boolean,
    name: string,
  };

  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  tilemapTexture: THREE.Texture;
  tilesetTexture: THREE.Texture;
  paletteTexture: THREE.Texture;

  uploadDataTextures({ uploadTilemap = false, uploadPalette = false }) {
    const { palette, tilemap, width, height, tileWidth, tileHeight } = this.props;

    warning(
      (width % tileWidth) === 0,
      'Tilemap layer width is not exactly is not a multiple of the tile width.'
    );

    warning(
      (height % tileHeight) === 0,
      'Tilemap layer height is not exactly is not a multiple of the tile height.'
    );

    if (uploadTilemap) {
      const tilemapWidth = Math.floor(width / tileWidth);
      const tilemapHeight = Math.floor(height / tileHeight);

      uploadDataToTexture.call(
        this.tilemapTexture,
        tilemap,
        tilemapWidth,
        tilemapHeight,
        THREE.AlphaFormat,
        false,
      );
    }

    warning(
      (palette.length % 4) === 0,
      'Palette must be an array of RGBA color values.',
    );

    if (uploadPalette) {
      uploadDataToTexture.call(
        this.paletteTexture,
        palette,
        256,
        1,
        THREE.RGBAFormat,
        false,
      );
    }
  }

  render() {
    const {
      name,
      transparent,
      tileWidth,
      tileHeight,
      width,
      height,
      x,
      y,
      z,
    } = this.props;

    const { container } = this.context;

    const boundingRectangle = calculateBoundingRectangle(
      container.width,
      container.height,
      width,
      height,
      x,
      y,
    );

    return (
      <object3D
        position={new THREE.Vector3(boundingRectangle.left, boundingRectangle.top, 0)}
        name={name}
      >
        <resources>
          <texture
            url=""
            wrapS={THREE.ClampToEdgeWrapping}
            wrapT={THREE.ClampToEdgeWrapping}
            magFilter={THREE.NearestFilter}
            minFilter={THREE.NearestFilter}
            resourceId="paletteTexture"
            ref={(ref) => { this.paletteTexture = ref; }}
          />
          <texture
            url=""
            wrapS={THREE.ClampToEdgeWrapping}
            wrapT={THREE.ClampToEdgeWrapping}
            magFilter={THREE.NearestFilter}
            minFilter={THREE.NearestFilter}
            resourceId="tilemapTexture"
            ref={(ref) => { this.tilemapTexture = ref; }}
          />
        </resources>
        <mesh renderOrder={z}>
          <planeGeometry width={boundingRectangle.width} height={boundingRectangle.height} />
          <shaderMaterial
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            transparent={transparent}
          >
            <uniforms>
              <uniform name="palette" type="t">
                <textureResource resourceId="paletteTexture" />
              </uniform>
              <uniform name="tilemap" type="t">
                <textureResource resourceId="tilemapTexture" />
              </uniform>
              <uniform
                type="v2"
                name="tileSize"
                value={new THREE.Vector2(tileWidth, tileHeight)}
              />
              <uniform
                type="v2"
                name="mapSize"
                value={new THREE.Vector2(width / tileWidth, height / tileHeight)}
              />
            </uniforms>
          </shaderMaterial>
        </mesh>
      </object3D>
    );
  }
}
