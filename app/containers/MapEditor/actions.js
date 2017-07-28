/*
 *
 * MapEditor actions
 *
 */

import {
  LOAD_MAP_ENTITY,
  LOAD_MAP_BLOCKSET,
  LOAD_MAP_DATA,
  EDIT_MAP,
  COMMIT_MAP_EDIT,
  SET_CAMERA_POSITION,
} from './constants';

export function loadMapEntity(entity) {
  return {
    type: LOAD_MAP_ENTITY,
    entity,
  };
}

export function loadMapBlockset(primary, entity, tiles) {
  return {
    type: LOAD_MAP_BLOCKSET,
    primary,
    entity,
    tiles,
  };
}

export function loadMapData(entity) {
  return {
    type: LOAD_MAP_DATA,
    entity,
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
