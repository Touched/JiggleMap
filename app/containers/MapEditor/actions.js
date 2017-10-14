/*
 *
 * MapEditor actions
 *
 */

import {
  LOAD_MAP_RESOURCE,
  LOAD_MAIN_MAP,
  LOAD_CONNECTED_MAP,
  EDIT_MAP,
  COMMIT_MAP_EDIT,
  SET_CAMERA_POSITION,
  MOVE_CONNECTION,
  COMMIT_CONNECTION_MOVE,
  MAP_LOADED,
  MOVE_ENTITY,
  COMMIT_ENTITY_MOVE,
  SET_ACTIVE_LAYER,
  SET_ACTIVE_TOOL,
} from './constants';

export function loadMapResource(resource) {
  return {
    type: LOAD_MAP_RESOURCE,
    resource,
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

export function editMap(patch) {
  return {
    type: EDIT_MAP,
    patch,
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

export function setActiveLayer(layer) {
  return {
    type: SET_ACTIVE_LAYER,
    layer,
  };
}

export function setActiveTool(tool) {
  return {
    type: SET_ACTIVE_TOOL,
    tool,
  };
}
