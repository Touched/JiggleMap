import { createSelector } from 'reselect';

/**
 * Direct selector to the editorTabs state domain
 */
const selectEditorTabsDomain = () => (state) => state.editorTabs;

const makeSelectEditorTabsTabStateDomain = (id) => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.byId[id].state,
);

/**
 * Other specific selectors
 */
const makeSelectEditorTabsActiveIndex = () => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.active,
);

const makeSelectEditorTabsNextId = () => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.nextId,
);

const makeSelectEditorTabsActive = () => (state) => {
  const substate = selectEditorTabsDomain()(state);
  const active = substate.active;

  if (!active) {
    return null;
  }

  const activeTab = substate.byId[active];

  return {
    ...activeTab,
    id: active,
  };
};

const makeSelectEditorTabsTab = (id) => createSelector(
  selectEditorTabsDomain(),
  (substate) => ({
    ...substate.byId[id],
    id,
  }),
);

/**
 * Default selector used by EditorTabs
 */
const makeSelectEditorTabs = () => createSelector(
  selectEditorTabsDomain(),
  /* (substate) => substate.get('tabs').map(
     (id) => substate.getIn(['byId', id]).set('id', id),
     ).toJS(), */
  (substate) => substate.tabs.map((id) => ({
    ...substate.byId[id],
    id,
  })),
);

export default makeSelectEditorTabs;
export {
  selectEditorTabsDomain,
  makeSelectEditorTabsTabStateDomain,
  makeSelectEditorTabsActiveIndex,
  makeSelectEditorTabsNextId,
  makeSelectEditorTabsActive,
  makeSelectEditorTabsTab,
};
