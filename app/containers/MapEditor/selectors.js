import { createSelector } from 'reselect';

/**
 * Direct selector to the mapEditor state domain
 */
const selectMapEditorDomain = () => (state) => state.get('map');

/**
 * Other specific selectors
 */


/**
 * Default selector used by MapEditor
 */

const makeSelectMapEditor = () => createSelector(
  selectMapEditorDomain(),
  (substate) => substate.toJS()
);

export default makeSelectMapEditor;
export {
  selectMapEditorDomain,
};
