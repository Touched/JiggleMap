/*
 *
 * EditorTabs actions
 *
 */

import {
  LOAD,
  SWITCH_TAB,
  NEW_TAB,
  CLOSE_TAB,
  REORDER_TABS,
  RELAY_ACTION_TO_TAB,
  LOAD_TAB,
} from './constants';

export function newTab() {
  return {
    type: NEW_TAB,
  };
}

export function reorderTabs(order) {
  return {
    type: REORDER_TABS,
    order,
  };
}

export function switchTab(id) {
  return {
    type: SWITCH_TAB,
    id,
  };
}

export function closeTab(id) {
  return {
    type: CLOSE_TAB,
    id,
  };
}

export function relayActionToTab(id, action) {
  return {
    type: RELAY_ACTION_TO_TAB,
    id,
    action,
  };
}

/**
 * Load something in the active tab or create a new tab
 */
export function loadTab(
  kind,
  { title = '', icon = null, meta = {} } = {},
  forceNewTab = false,
  focusTab = false,
) {
  return {
    type: LOAD_TAB,
    kind,
    title,
    icon,
    meta,
    forceNewTab,
    focusTab,
  };
}

/**
 * The loading event
 */
export function load(kind, meta) {
  return {
    type: LOAD,
    kind,
    meta,
  };
}
