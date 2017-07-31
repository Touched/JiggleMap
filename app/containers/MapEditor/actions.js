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

export function loadConnectedMap({ map, blocksets, direction, offset }) {
  return {
    type: LOAD_CONNECTED_MAP,
    map,
    blocksets,
    direction,
    offset,
  };
}

export function editMap(start, end, modifiers) {
  return {
    type: EDIT_MAP,
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
