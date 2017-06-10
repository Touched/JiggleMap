/*
 *
 * MapEditor actions
 *
 */

import {
  LOAD_MAP_ENTITY,
  LOAD_MAP_BLOCKSET,
  LOAD_MAP_DATA,
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
