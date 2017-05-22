/*
 *
 * App actions
 *
 */

import {
  LOAD_PROJECT,
  LOAD_PROJECT_ERROR,
  LOAD_PROJECT_SUCCESS,
  ADD_ENTITY,
  SET_SIDEBAR_ITEM,
} from './constants';

export function loadProject() {
  return {
    type: LOAD_PROJECT,
  };
}

export function loadProjectError(error) {
  return {
    type: LOAD_PROJECT_ERROR,
    error,
  };
}

export function loadProjectSuccess() {
  return {
    type: LOAD_PROJECT_SUCCESS,
  };
}

export function addEntity(path, meta) {
  return {
    type: ADD_ENTITY,
    entity: {
      type: meta.format.type,
      id: meta.id,
      name: meta.name,
      description: meta.description,
      icon: null,
      path,
    },
  };
}

export function setSidebarItem(item) {
  return {
    type: SET_SIDEBAR_ITEM,
    item,
  };
}
