/*
 *
 * App reducer
 *
 */

import {
  LOAD_PROJECT,
  LOAD_PROJECT_SUCCESS,
  LOAD_PROJECT_ERROR,
  ADD_RESOURCE,
  SET_SIDEBAR_ITEM,
} from './constants';

const initialState = {
  loading: false,
  error: false,
  resources: {},
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
        resources: {},
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
        resources: {},
      };
    case ADD_RESOURCE:
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.resource.type]: {
            ...state.resources[action.resource.type],
            [action.resource.id]: action.resource,
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
