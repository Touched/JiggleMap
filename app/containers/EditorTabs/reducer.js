/*
 *
 * EditorTabs reducer
 *
 */

import { fromJS } from 'immutable';
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

const initialState = fromJS({
  active: '0',
  nextId: '1',
  tabs: [
    '0',
  ],
  byId: {
    0: newTabState,
  },
});

function combineTabReducers(reducers) {
  function newTab(state) {
    const id = state.get('nextId');

    return state.mergeDeep({
      active: id,
      nextId: String(parseInt(id, 10) + 1),
      byId: {
        [id]: newTabState,
      },
    }).update('tabs', (tabs) => tabs.push(id));
  }

  function loadTab(state, { icon, title, kind, forceNewTab, focusTab }) {
    const activeId = state.get('active');
    const nextId = state.get('nextId');

    const merger = {
      kind,
      title,
      icon,

      // Set the initial state for this tab
      state: reducers[kind](undefined, {}),
    };

    if (forceNewTab || activeId === null) {
      const newState = newTab(state).mergeIn(['byId', nextId], merger);

      // Allow tabs to be opened in the background
      if (!focusTab && activeId) {
        return newState.set('active', activeId);
      }

      return newState;
    }

    return state.mergeIn(['byId', activeId], merger);
  }

  return function tabReducer(state = initialState, action) {
    switch (action.type) {
      case SWITCH_TAB:
        if (state.get('tabs').contains(action.id)) {
          return state.set('active', action.id);
        }

        return state;
      case NEW_TAB:
        return newTab(state);
      case REORDER_TABS:
        // Ensure that only the order is being changed (i.e. the set of current tabs has not changed)
        if (state.get('tabs').toSet().equals(fromJS(action.order).toSet())) {
          return state.set('tabs', fromJS(action.order));
        }

        return state;
      case CLOSE_TAB:
        return state.update('tabs', (tabs) => tabs.filter((x) => x !== action.id))
          .deleteIn(['byId', action.id])
          .update('active', (active) => {
            const tabs = state.get('tabs');

            // Closing the last tab, so there can't be an active tab
            if (tabs.size === 1) {
              return null;
            }

            // Closing the active tab, so the active tab needs to be moved
            if (active === action.id) {
              const activeIndex = state.get('tabs').indexOf(active);
              const newIndex = activeIndex + 1 === tabs.size ? activeIndex - 1 : activeIndex + 1;

              return state.getIn(['tabs', newIndex]);
            }

            return active;
          });
      case LOAD_TAB:
        return loadTab(state, action);
      case RELAY_ACTION_TO_TAB:
        return state.updateIn(['byId', action.id, 'state'], (tabState) => {
          const activeTabKind = state.getIn(['byId', action.id, 'kind']);

          if (activeTabKind === null) {
            return tabState;
          }

          return reducers[activeTabKind](tabState, action.action);
        });
      default:
        return state;
    }
  };
}
export default combineTabReducers;
