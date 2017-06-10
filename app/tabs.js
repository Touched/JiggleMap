import invariant from 'invariant';

import createTabMiddleware from 'containers/EditorTabs/sagaMiddleware';

import mapEditorReducer from 'containers/MapEditor/reducer';
import mapEditorSagas from 'containers/MapEditor/sagas';
import MapEditor from 'containers/MapEditor';

const tabTypes = {
  map: {
    sagas: mapEditorSagas,
    reducer: mapEditorReducer,
    route: MapEditor,
  },
};

function pick(property) {
  return Object.keys(tabTypes).reduce((result, key) => {
    const value = tabTypes[key][property];

    invariant(value, `Expected '${property}' to be defined for tab type '${key}'.`);

    return {
      ...result,
      [key]: value,
    };
  }, {});
}

export function buildTabMiddleware() {
  return createTabMiddleware(pick('sagas'));
}

export function buildTabRoutes() {
  return pick('route');
}

export function buildTabReducers() {
  return pick('reducer');
}
