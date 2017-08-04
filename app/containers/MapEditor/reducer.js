/*
 *
 * MapEditor reducer
 *
 */

import R from 'ramda';
import { combineReducers } from 'redux';
import undoable, { includeAction } from 'redux-undo';
import * as THREE from 'three';
import { calculateBoundingRectangle } from 'components/Renderer/utils';

import {
  LOAD_MAIN_MAP,
  LOAD_CONNECTED_MAP,
  EDIT_MAP,
  COMMIT_MAP_EDIT,
  SET_CAMERA_POSITION,
  MOVE_CONNECTION,
  COMMIT_CONNECTION_MOVE,
  RESIZE_VIEWPORT,
  SET_CURRENT_BLOCK,
  MAP_LOADED,
  MOVE_ENTITY,
  COMMIT_ENTITY_MOVE,
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

const initialDataState = {
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
  canonicalEntityCoordinates: [],
};

const initialEditingState = {
  loading: false,
  linked: false,
  viewportSize: {
    width: 0,
    height: 0,
  },
  camera: {
    x: 0,
    y: 0,
    z: 1,
  },
  toolState: {
    currentBlock: 0,
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

function editMap(toolState, data, start, end) {
  const patch = drawLine(start.x, start.y, end.x, end.y, (x, y) => ({
    x,
    y,
    block: toolState.currentBlock,
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

function mapDataReducer(state = initialDataState, action) {
  switch (action.type) {
    case LOAD_MAIN_MAP: {
      const loadedData = action.map ? loadMapData(action.map.data.map) : state.map;

      return {
        ...state,
        map: loadedData,
        canonicalMap: action.map ? loadedData : state.canonicalMap,
        blocksets: action.blocksets ? loadBlocksetData(action.blocksets) : state.blocksets,
        entities: action.map.data.entities,
        canonicalEntityCoordinates: action.map.data.entities.map(({ x, y }) => ({ x, y })),
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
        map: editMap(action.toolState, state.canonicalMap, action.start, action.end, action.modifiers),
      };
    case COMMIT_MAP_EDIT:
      return {
        ...state,
        canonicalMap: state.map,
      };
    case MOVE_CONNECTION: {
      const { direction } = state.connections[action.connection];
      const canonicalOffset = state.canonicalConnectionOffsets[action.connection];

      const [width, height] = state.map.dimensions;

      let offset;
      switch (direction) {
        case 'left':
        case 'right':
          offset = Math.max(Math.min(canonicalOffset + action.y, height), -height);
          break;
        case 'up':
        case 'down':
          offset = Math.max(Math.min(canonicalOffset + action.x, width), -width);
          break;
        default:
          offset = 0;
          break;
      }

      const lens = R.lensPath(['connections', action.connection, 'offset']);
      return R.set(lens, offset, state);
    }
    case COMMIT_CONNECTION_MOVE: {
      const lens = R.lensPath(['canonicalConnectionOffsets', action.connection]);
      return R.set(lens, state.connections[action.connection].offset, state);
    }
    case MOVE_ENTITY: {
      const index = state.entities.findIndex(({ id }) => id === action.id);

      if (index >= 0) {
        const [width, height] = state.map.dimensions;
        const { x: canonicalX, y: canonicalY } = state.canonicalEntityCoordinates[index];

        const x = Math.max(Math.min(canonicalX + action.x, width - 1), 0);
        const y = Math.max(Math.min(canonicalY + action.y, height - 1), 0);

        const lens = R.lensPath(['entities', index]);
        return R.over(lens, R.merge(R.__, { x, y }), state); // eslint-disable-line no-underscore-dangle
      }

      return state;
    }
    case COMMIT_ENTITY_MOVE: {
      const index = state.entities.findIndex(({ id }) => id === action.id);

      if (index >= 0) {
        const { x, y } = state.entities[index];
        const lens = R.lensPath(['canonicalEntityCoordinates', index]);
        return R.over(lens, R.merge(R.__, { x, y }), state); // eslint-disable-line no-underscore-dangle
      }

      return state;
    }
    default:
      return state;
  }
}

function mapEditingReducer(state = initialEditingState, action) {
  switch (action.type) {
    case LOAD_MAIN_MAP: {
      const { viewportSize: { width, height } } = state;
      const { width: mapWidth, height: mapHeight } = action.map.data.map;
      const boundingBox = calculateBoundingRectangle(width, height, mapWidth * 16, mapHeight * 16, 0, 0);
      const min = new THREE.Vector3(0, 0, 0);
      const max = new THREE.Vector3(boundingBox.width, boundingBox.height, 0);
      const box = new THREE.Box3(min, max);
      const midpoint = box.getCenter();

      return {
        ...state,
        camera: {
          ...state.camera,
          x: midpoint.x,
          y: -midpoint.y,
        },
      };
    }
    case SET_CAMERA_POSITION:
      return {
        ...state,
        camera: {
          x: action.x,
          y: action.y,
          z: action.z,
        },
      };
    case RESIZE_VIEWPORT:
      return {
        ...state,
        viewportSize: {
          width: action.width,
          height: action.height,
        },
      };
    case SET_CURRENT_BLOCK:
      return {
        ...state,
        toolState: {
          ...state.toolState,
          currentBlock: action.block,
        },
      };
    default:
      return state;
  }
}

// Split the reducers into undoable map data and other editing state
export default combineReducers({
  editing: mapEditingReducer,
  data: undoable(mapDataReducer, {
    limit: 10,
    filter: includeAction([MAP_LOADED, COMMIT_CONNECTION_MOVE, COMMIT_MAP_EDIT, COMMIT_ENTITY_MOVE]),
    ignoreInitialState: true,
  }),
});
