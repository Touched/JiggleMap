/*
 *
 * MapEditor reducer
 *
 */

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

const initialState = {
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
};

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

function setMapDataValue(oldData, newData, index, value) {
  if (value === undefined || oldData[index] === value) {
    return newData;
  }

  const dataCopy = newData || oldData.slice();
  dataCopy[index] = value;
  return dataCopy;
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

  let mapBlockData = null; // data.block.slice();
  const [width] = data.dimensions;

  patch.forEach(({ x, y, block }) => {
    const index = x + (y * width);
    mapBlockData = setMapDataValue(data.block, mapBlockData, index, block);
  });

  if (mapBlockData) {
    return {
      ...data,
      block: mapBlockData,
    };
  }

  return data;
}

function mapEditorReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_MAP_BLOCKSET:
      return {
        ...state,
        blocksets: {
          ...state.blocksets,
          [action.primary ? 'primary' : 'secondary']: {
            id: action.entity.meta.id,
            palette: action.entity.data.palette,
            blocks: action.entity.data.blocks,
            tiles: action.tiles,
          },
        },
      };
    case LOAD_MAP_DATA:
      return {
        ...state,
        map: loadMapData(action.entity.data.map),
      };
    case EDIT_MAP:
      return {
        ...state,
        map: editMap(state.map, action.start, action.end, action.modifiers),
      };
    default:
      return state;
  }
}

export default mapEditorReducer;
