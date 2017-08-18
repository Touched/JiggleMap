import invariant from 'invariant';
import path from 'path';
import { call, select, all } from 'redux-saga/effects';
import native from 'native';

import fs from 'utils/fs';
import { takeLatestRelayed, putRelayed } from 'containers/EditorTabs/sagaEffects';
import { LOAD } from 'containers/EditorTabs/constants';
import { makeSelectResource } from 'containers/App/selectors';
import { parseResource } from 'containers/App/sagas';
import { loadMainMap, loadConnectedMap, mapLoaded } from './actions';

export function* loadBlockset(primary, { id, type }) {
  invariant(
    type === 'blockset',
    `loadBlocksetData can only load blockset resources, but it receieved a '${type}'`,
  );

  const { path: resourcePath } = yield select(makeSelectResource(type, id));
  const resource = yield call(parseResource, type, resourcePath);

  // TODO: ensure resource.data.primary === primary

  const tilesPath = path.resolve(path.dirname(resourcePath), resource.data.tiles.path);
  const tilesBuffer = yield call(fs.readFileAsync.bind(fs), tilesPath);
  const tilesData = native.decode(tilesBuffer);

  // TODO: Error handling for bad PNGs/dimensions
  return {
    resource,
    tiles: Array.from(tilesData.pixels),
  };
}

export function* loadData({ id, type }) {
  invariant(
    type === 'map',
    `loadMapData can only load map resources, but it receieved a '${type}'`,
  );

  const { path: resourcePath } = yield select(makeSelectResource(type, id));
  return yield call(parseResource, type, resourcePath);
}

function* loadSingleMap({ id, type }) {
  invariant(
    type === 'map',
    `loadMapData can only load map resources, but it receieved a '${type}'`,
  );

  const { path: resourcePath } = yield select(makeSelectResource(type, id));
  const resource = yield call(parseResource, type, resourcePath);

  const [primary, secondary] = yield all([
    call(loadBlockset, true, resource.data.blocksets.primary),
    call(loadBlockset, false, resource.data.blocksets.secondary),
  ]);

  return {
    map: resource,
    blocksets: {
      primary,
      secondary,
    },
  };
}

function* loadSingleMapConnection(resourceId, direction, offset) {
  return {
    ...yield call(loadSingleMap, resourceId),
    direction,
    offset,
  };
}

export function* loadMap({ id, action: { meta } }) {
  const mainMap = yield call(loadSingleMap, meta);
  yield putRelayed(id, loadMainMap(mainMap));

  const connections = yield all(mainMap.map.data.connections.map(({ direction, map, offset }) =>
    call(loadSingleMapConnection, map, direction, offset),
  ));

  yield all(connections.map((connection) => putRelayed(id, loadConnectedMap(connection))));

  // Mark the map as having finished loading
  yield putRelayed(id, mapLoaded());

  // TODO: Take a SAVE action for any of the loaded resources and trigger a reload
}

export function* loadMapSaga(tabId) {
  yield takeLatestRelayed(tabId, LOAD, loadMap);
}

// All sagas to be loaded
export default [
  loadMapSaga,
];
