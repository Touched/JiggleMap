/*
 *
 * EditorTabs reducer
 *
 */

import R from 'ramda';
import invariant from 'invariant';

import {
  SWITCH_TAB,
  NEW_TAB,
  CLOSE_TAB,
  LOAD_TAB,
  REORDER_TABS,
  RELAY_ACTION_TO_TAB,
} from './constants';

export const newTabState = {
  icon: null,
  title: 'New Tab',
  kind: null,
  state: null,
  dirty: false,
};

const initialState = {
  active: '0',
  nextId: '1',
  tabs: [
    '0',
  ],
  byId: {
    0: newTabState,
  },
};

function combineTabReducers(reducers) {
  function newTab(state) {
    const { nextId: id } = state;

    return {
      ...state,
      active: id,
      nextId: String(parseInt(id, 10) + 1),
      byId: {
        ...state.byId,
        [id]: newTabState,
      },
      tabs: [...state.tabs, id],
    };
  }

  function loadTab(state, { icon, title, kind, forceNewTab, focusTab }) {
    const { active: activeId, nextId } = state;

    const tabState = {
      kind,
      title,
      icon,

      // Set the initial state for this tab
      state: reducers[kind](undefined, {}),
    };

    if (forceNewTab || activeId === null) {
      const newState = newTab(state);

      return {
        ...newState,
        byId: {
          ...newState.byId,
          [nextId]: tabState,
        },
        active: (!focusTab && activeId) ? activeId : nextId,
      };
    }

    return {
      ...state,
      byId: {
        ...state.byId,
        [activeId]: tabState,
      },
    };
  }

  return function tabReducer(state = initialState, action) {
    switch (action.type) {
      case SWITCH_TAB:
        if (R.contains(action.id, state.tabs)) {
          return {
            ...state,
            active: action.id,
          };
        }

        return state;
      case NEW_TAB:
        return newTab(state);
      case REORDER_TABS: {
        // Ensure that only the order is being changed (i.e. the set of current tabs has not changed)
        const sort = R.compose(R.sort(R.ascend(R.identity)), R.map((x) => parseInt(x, 10)));

        if (R.equals(sort(state.tabs), sort(action.order))) {
          return {
            ...state,
            tabs: action.order,
          };
        }

        return state;
      }
      case CLOSE_TAB: {
        let { active } = state;
        const tabCount = state.tabs.length;

        if (tabCount === 1) {
          // When closing the last tab, there won't be an active tab so set it to null
          active = null;
        } else if (state.active === action.id) {
          // When closing the active tab, a new tab must be selected
          const activeIndex = state.tabs.indexOf(state.active);
          invariant(activeIndex >= 0, 'Active tab ID was not found in the tab list');

          // Closing the rightmost tab should set the active tab to the tab on its left, otherwise
          // it should close the tab on its right.
          const newIndex = activeIndex + 1 === tabCount ? activeIndex - 1 : activeIndex + 1;
          invariant(newIndex < tabCount && newIndex >= 0, 'New active tab index was invalid');
          active = state.tabs[newIndex];
        }

        return {
          ...state,
          byId: R.dissoc(action.id, state.byId),
          tabs: R.reject(R.equals(action.id), state.tabs),
          active,
        };
      }
      case LOAD_TAB:
        return loadTab(state, action);
      case RELAY_ACTION_TO_TAB: {
        const tab = state.byId[action.id];

        return {
          ...state,
          byId: {
            ...state.byId,
            [action.id]: {
              ...state.byId[action.id],
              state: tab.kind === null ? tab.state : reducers[tab.kind](tab.state, action.action),
            },
          },
        };
      }
      default:
        return state;
    }
  };
}
export default combineTabReducers;
