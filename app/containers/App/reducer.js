/*
 *
 * App reducer
 *
 */

import {
  LOAD_PROJECT,
  LOAD_PROJECT_SUCCESS,
  LOAD_PROJECT_ERROR,
  ADD_ENTITY,
  SET_SIDEBAR_ITEM,
} from './constants';

const initialState = {
  loading: false,
  error: false,
  entities: {},
  sidebarItem: null,
  path: null,
};

function projectReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECT:
      return {
        ...state,
        error: false,
        loading: true,
        entities: {},
      };
    case LOAD_PROJECT_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case LOAD_PROJECT_ERROR:
      return {
        ...state,
        loading: false,
        error: true,
        path: null,
        entities: {},
      };
    case ADD_ENTITY:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entity.type]: {
            ...state.entities[action.entity.type],
            [action.entity.id]: action.entity,
          },
        },
      };
    case SET_SIDEBAR_ITEM:
      return {
        ...state,
        sidebarItem: action.item,
      };
    default:
      return state;
  }
}

export default projectReducer;
