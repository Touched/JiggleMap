/*
 *
 * MapEditor reducer
 *
 */

import R from 'ramda';

import {
  LOAD_MAIN_MAP,
  LOAD_CONNECTED_MAP,
  EDIT_MAP,
  COMMIT_MAP_EDIT,
  SET_CAMERA_POSITION,
  MOVE_CONNECTION,
  COMMIT_CONNECTION_MOVE,
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
  canonicalConnectionOffsets: [],
  entities: [],
  camera: {
    x: 0,
    y: 0,
    z: 1,
  },
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

function loadBlocksetData(data) {
  return {
    primary: {
      id: data.primary.entity.meta.id,
      palette: data.primary.entity.data.palette,
      blocks: data.primary.entity.data.blocks,
      tiles: data.primary.tiles,
    },
    secondary: {
      id: data.secondary.entity.meta.id,
      palette: data.secondary.entity.data.palette,
      blocks: data.secondary.entity.data.blocks,
      tiles: data.secondary.tiles,
    },
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
    case LOAD_MAIN_MAP: {
      const loadedData = action.map ? loadMapData(action.map.data.map) : state.map;

      return {
        ...state,
        map: loadedData,
        canonicalMap: action.map ? loadedData : state.canonicalMap,
        blocksets: action.blocksets ? loadBlocksetData(action.blocksets) : state.blocksets,
      };
    }
    case LOAD_CONNECTED_MAP:
      return {
        ...state,
        connections: [
          ...state.connections, {
            map: loadMapData(action.map.data.map),
            blocksets: loadBlocksetData(action.blocksets),
            direction: action.direction,
            offset: action.offset,
          },
        ],
        canonicalConnectionOffsets: [
          ...state.canonicalConnectionOffsets,
          action.offset,
        ],
      };
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
    case SET_CAMERA_POSITION:
      return {
        ...state,
        camera: {
          x: action.x,
          y: action.y,
          z: action.z,
        },
      };
    case MOVE_CONNECTION: {
      const { direction } = state.connections[action.connection];
      const canonicalOffset = state.canonicalConnectionOffsets[action.connection];

      let movement;
      switch (direction) {
        case 'left':
        case 'right':
          movement = action.y;
          break;
        case 'up':
        case 'down':
          movement = action.x;
          break;
        default:
          movement = 0;
          break;
      }

      const lens = R.lensPath(['connections', action.connection, 'offset']);
      return R.set(lens, canonicalOffset + movement, state);
    }
    case COMMIT_CONNECTION_MOVE: {
      const lens = R.lensPath(['connections', action.connection, 'canonicalConnectionOffsets']);
      return R.set(lens, state.connections[action.connection].offset, state);
    }
    default:
      return state;
  }
}

export default mapEditorReducer;
