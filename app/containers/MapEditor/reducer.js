/*
 *
 * MapEditor reducer
 *
 */

import {
  LOAD_MAP_BLOCKSET,
  LOAD_MAP_DATA,
  EDIT_MAP,
  COMMIT_MAP_EDIT,
} from './constants';

import { drawLine } from './tools/helpers';

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

  // When the user is editing (i.e. dragging the mouse around), the changes they make are
  // applied to the data in 'map' for UI feedback. They are then copied to 'canonicalMap'
  // when they lift the mouse button.
  map: mapData,
  canonicalMap: mapData,
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
  const patch = drawLine(start.x, start.y, end.x, end.y, (x, y) => ({
    x,
    y,
    block: 0,
  }));

  let mapBlockData = null;
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
    case LOAD_MAP_DATA: {
      const loadedData = loadMapData(action.entity.data.map);

      return {
        ...state,
        map: loadedData,
        canonicalMap: loadedData,
      };
    }
    case EDIT_MAP:
      return {
        ...state,
        // Changes are applied to the canonical map, but saved in the map so that they are
        // visible to the user.
        map: editMap(state.canonicalMap, action.start, action.end, action.modifiers),
      };
    case COMMIT_MAP_EDIT:
      return {
        ...state,
        canonicalMap: state.map,
      };
    default:
      return state;
  }
}

export default mapEditorReducer;
