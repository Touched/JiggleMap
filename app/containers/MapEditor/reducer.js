/*
 *
 * MapEditor reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_MAP_BLOCKSET,
  LOAD_MAP_DATA,
  EDIT_MAP,
} from './constants';

const mapData = {
  dimensions: [0, 0],
  height: [],
  collision: [],
  block: [],
};

const blocksetData = {
  id: null,
  palette: [],
  blocks: [],
  tiles: [],
};

const initialState = fromJS({
  loading: false,
  linked: false,
  border: mapData,
  map: mapData,
  blocksets: {
    primary: blocksetData,
    secondary: blocksetData,
  },
  scripts: [],
  connections: [],
  entities: [],
});

function loadMapData(data) {
  const {
    width: dataWidth,
    height: dataHeight,
    data: { block, collision, height },
  } = data;

  return {
    dimensions: [dataWidth, dataHeight],
    block,
    collision,
    height,
  };
}

function editMap(data, start, end) {
  const patch = [{
    x: start.x,
    y: start.y,
    block: 0,
  }, {
    x: end.x,
    y: end.y,
    block: 0,
  }];

  const mutableBlock = data.get('block').asMutable();
  const [width] = data.get('dimensions');

  patch.forEach(({ x, y, block }) => {
    const index = x + (y * width);

    if (block !== undefined) {
      mutableBlock.set(index, block);
    }
  });

  return data.set('block', mutableBlock.asImmutable());
}

function mapEditorReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_MAP_BLOCKSET:
      return state.mergeIn(['blocksets', action.primary ? 'primary' : 'secondary'], {
        id: action.entity.meta.id,
        palette: fromJS(action.entity.data.palette),
        blocks: fromJS(action.entity.data.blocks),
        tiles: fromJS(action.tiles),
      });
    case LOAD_MAP_DATA:
      return state.mergeIn(['map'], loadMapData(action.entity.data.map));
    case EDIT_MAP:
      return state.update('map', (map) => editMap(map, action.start, action.end, action.modifiers));
    default:
      return state;
  }
}

export default mapEditorReducer;
