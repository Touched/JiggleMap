/* @flow */

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

export function reorderTabs(order: Array<string>) {
  return {
    type: REORDER_TABS,
    order,
  };
}

export function switchTab(id: string) {
  return {
    type: SWITCH_TAB,
    id,
  };
}

export function closeTab(id: string) {
  return {
    type: CLOSE_TAB,
    id,
  };
}

export function relayActionToTab(id: string, action: { type: string }) {
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
  kind: string,
  options: { title?: string, icon?: string, meta?: Object } = {},
  forceNewTab: boolean = false,
  focusTab: boolean = false,
) {
  const { title = '', icon = null, meta = {} } = options;

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
export function load(kind: string, meta: Object) {
  return {
    type: LOAD,
    kind,
    meta,
  };
}
