import { createSelector } from 'reselect';

/**
 * Direct selector to the editorTabs state domain
 */
const selectEditorTabsDomain = () => (state) => state.get('editorTabs');

const makeSelectEditorTabsTabStateDomain = (id) => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.getIn(['byId', id, 'state']),
);

/**
 * Other specific selectors
 */
const makeSelectEditorTabsActiveIndex = () => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.get('active'),
);

const makeSelectEditorTabsNextId = () => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.get('nextId'),
);

const makeSelectEditorTabsActive = () => (state) => {
  const substate = selectEditorTabsDomain()(state);
  const active = substate.get('active');

  if (!active) {
    return null;
  }

  const activeTab = substate.getIn(['byId', active]);

  return activeTab.set('id', active).toJS();
};

const makeSelectEditorTabsTab = (id) => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.getIn(['byId', id]).set('id', id).toJS(),
);

/**
 * Default selector used by EditorTabs
 */
const makeSelectEditorTabs = () => createSelector(
  selectEditorTabsDomain(),
  (substate) => substate.get('tabs').map(
    (id) => substate.getIn(['byId', id]).set('id', id),
  ).toJS(),
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
