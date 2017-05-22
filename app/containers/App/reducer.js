/*
 *
 * App reducer
 *
 */

import { Record, Map } from 'immutable';

import {
  LOAD_PROJECT,
  LOAD_PROJECT_SUCCESS,
  LOAD_PROJECT_ERROR,
  ADD_ENTITY,
  SET_SIDEBAR_ITEM,
} from './constants';

export const ProjectState = Record({
  loading: false,
  error: false,
  entities: Map(),
  sidebarItem: null,
});

function projectReducer(state = new ProjectState(), action) {
  switch (action.type) {
    case LOAD_PROJECT:
      return state.merge({
        error: false,
        loading: true,
        entities: Map(),
      });
    case LOAD_PROJECT_SUCCESS:
      return state.set('loading', false);
    case LOAD_PROJECT_ERROR:
      return state.merge({
        loading: false,
        error: true,
        entities: Map(),
      });
    case ADD_ENTITY:
      return state.setIn(['entities', action.entity.type, action.entity.id], action.entity);
    case SET_SIDEBAR_ITEM:
      return state.set('sidebarItem', action.item);
    default:
      return state;
  }
}

export default projectReducer;
