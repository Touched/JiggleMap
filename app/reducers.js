/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers } from 'redux';

import languageProviderReducer from 'containers/LanguageProvider/reducer';
import projectReducer from 'containers/App/reducer';
import combineTabReducers from 'containers/EditorTabs/reducer';
import { buildTabReducers } from './tabs';

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers) {
  return combineReducers({
    editorTabs: combineTabReducers(buildTabReducers()),
    project: projectReducer,
    language: languageProviderReducer,
    ...asyncReducers,
  });
}
