/*
 *
 * MapEditor actions
 *
 */

import {
  LOAD_MAP_ENTITY,
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

export function loadMapEntity(entity) {
  return {
    type: LOAD_MAP_ENTITY,
    entity,
  };
}

export function loadMainMap({ map, blocksets }) {
  return {
    type: LOAD_MAIN_MAP,
    map,
    blocksets,
  };
}

export function mapLoaded() {
  return {
    type: MAP_LOADED,
  };
}

export function loadConnectedMap({ map, blocksets, direction, offset }) {
  return {
    type: LOAD_CONNECTED_MAP,
    map,
    blocksets,
    direction,
    offset,
  };
}

export function editMap(toolState, start, end, modifiers) {
  return {
    type: EDIT_MAP,
    toolState,
    start,
    end,
    modifiers,
  };
}

export function commitMapEdit() {
  return {
    type: COMMIT_MAP_EDIT,
  };
}

export function setCameraPosition(x, y, z) {
  return {
    type: SET_CAMERA_POSITION,
    x,
    y,
    z,
  };
}

export function moveConnection(connection, x, y) {
  return {
    type: MOVE_CONNECTION,
    connection,
    x,
    y,
  };
}

export function commitConnectionMove(connection) {
  return {
    type: COMMIT_CONNECTION_MOVE,
    connection,
  };
}

export function resizeViewport(width, height) {
  return {
    type: RESIZE_VIEWPORT,
    width,
    height,
  };
}

export function setCurrentBlock(block) {
  return {
    type: SET_CURRENT_BLOCK,
    block,
  };
}

export function moveEntity(id, x, y) {
  return {
    type: MOVE_ENTITY,
    id,
    x,
    y,
  };
}

export function commitEntityMove(id) {
  return {
    type: COMMIT_ENTITY_MOVE,
    id,
  };
}
