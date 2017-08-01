/*
 *
 * MapEditor reducer
 *
 */

import R from 'ramda';
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
  viewportSize: {
    width: 0,
    height: 0,
  },
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
  currentBlock: 0,
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

function editMap(state, data, start, end) {
  const patch = drawLine(start.x, start.y, end.x, end.y, (x, y) => ({
    x,
    y,
    block: state.currentBlock,
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
      const { viewportSize: { width, height } } = state;
      const { dimensions } = loadedData;
      const boundingBox = calculateBoundingRectangle(width, height, dimensions[0] * 16, dimensions[1] * 16, 0, 0);
      const min = new THREE.Vector3(0, 0, 0);
      const max = new THREE.Vector3(boundingBox.width, boundingBox.height, 0);
      const box = new THREE.Box3(min, max);
      const midpoint = box.getCenter();

      return {
        ...state,
        map: loadedData,
        canonicalMap: action.map ? loadedData : state.canonicalMap,
        blocksets: action.blocksets ? loadBlocksetData(action.blocksets) : state.blocksets,
        camera: {
          ...state.camera,
          x: midpoint.x,
          y: -midpoint.y,
        },
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
        map: editMap(state, state.canonicalMap, action.start, action.end, action.modifiers),
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
    case RESIZE_VIEWPORT:
      return {
        ...state,
        viewportSize: {
          width: action.width,
          height: action.height,
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
    case SET_CURRENT_BLOCK:
      return {
        ...state,
        currentBlock: action.block,
      };
    default:
      return state;
  }
}

export default undoable(mapEditorReducer, {
  limit: 10,
  filter: includeAction([MAP_LOADED, COMMIT_CONNECTION_MOVE, COMMIT_MAP_EDIT]),
  ignoreInitialState: true,
});
