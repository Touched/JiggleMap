/*
 *
 * MapEditor reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_MAP_BLOCKSET,
  LOAD_MAP_DATA,
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
    default:
      return state;
  }
}

export default mapEditorReducer;
