const map = require('./map.json');
const primaryBlockset = require('./blockset-primary.json');
const primaryBlocksetTiles = require('./blockset-primary-tiles.json');
const secondaryBlockset = require('./blockset-secondary.json');
const secondaryBlocksetTiles = require('./blockset-secondary-tiles.json');

export default {
  width: map.data.map.width,
  height: map.data.map.height,
  blocksets: {
    primary: {
      palette: primaryBlockset.data.palette,
      blocks: primaryBlockset.data.blocks,
      tiles: primaryBlocksetTiles,
    },
    secondary: {
      palette: secondaryBlockset.data.palette,
      blocks: secondaryBlockset.data.blocks,
      tiles: secondaryBlocksetTiles,
    },
  },
  map: {
    block: map.data.map.data.block,
    collision: map.data.map.data.collision,
    height: map.data.map.data.height,
  },
};
