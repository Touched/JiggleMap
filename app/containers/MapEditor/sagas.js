import invariant from 'invariant';
import path from 'path';
import { call, select, all } from 'redux-saga/effects';
import native from 'native';

import fs from 'utils/fs';
import { takeLatestRelayed, putRelayed } from 'containers/EditorTabs/sagaEffects';
import { LOAD } from 'containers/EditorTabs/constants';
import { makeSelectEntity } from 'containers/App/selectors';
import { parseEntity } from 'containers/App/sagas';
import { loadMainMap, loadConnectedMap, mapLoaded } from './actions';

export function* loadBlockset(primary, { id, type }) {
  invariant(
    type === 'blockset',
    `loadBlocksetData can only load blockset entities, but it receieved a '${type}'`,
  );

  const { path: entityPath } = yield select(makeSelectEntity(type, id));
  const entity = yield call(parseEntity, type, entityPath);

  // TODO: ensure entity.data.primary === primary

  const tilesPath = path.resolve(path.dirname(entityPath), entity.data.tiles.path);
  const tilesBuffer = yield call(fs.readFileAsync.bind(fs), tilesPath);
  const tilesData = native.decode(tilesBuffer);

  // TODO: Error handling for bad PNGs/dimensions
  return {
    entity,
    tiles: Array.from(tilesData.pixels),
  };
}

export function* loadData({ id, type }) {
  invariant(
    type === 'map',
    `loadMapData can only load map entities, but it receieved a '${type}'`,
  );

  const { path: entityPath } = yield select(makeSelectEntity(type, id));
  return yield call(parseEntity, type, entityPath);
}

function* loadSingleMap({ id, type }) {
  invariant(
    type === 'map',
    `loadMapData can only load map entities, but it receieved a '${type}'`,
  );

  const { path: entityPath } = yield select(makeSelectEntity(type, id));
  const entity = yield call(parseEntity, type, entityPath);

  const [primary, secondary] = yield all([
    call(loadBlockset, true, entity.data.blocksets.primary),
    call(loadBlockset, false, entity.data.blocksets.secondary),
  ]);

  return {
    map: entity,
    blocksets: {
      primary,
      secondary,
    },
  };
}

function* loadSingleMapConnection(entityId, direction, offset) {
  return {
    ...yield call(loadSingleMap, entityId),
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

  // TODO: Take a SAVE action for any of the loaded entities and trigger a reload
}

export function* loadMapSaga(tabId) {
  yield takeLatestRelayed(tabId, LOAD, loadMap);
}

// All sagas to be loaded
export default [
  loadMapSaga,
];
