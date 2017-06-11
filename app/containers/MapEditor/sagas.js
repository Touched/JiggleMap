import invariant from 'invariant';
import path from 'path';
import { call, select } from 'redux-saga/effects';
import native from 'native';

import fs from 'utils/fs';
import { takeLatestRelayed, putRelayed } from 'containers/EditorTabs/sagaEffects';
import { LOAD } from 'containers/EditorTabs/constants';
import { makeSelectEntity } from 'containers/App/selectors';
import { parseEntity } from 'containers/App/sagas';
import { loadMapBlockset, loadMapData } from './actions';

export function* loadBlockset(tabId, primary, { id, type }) {
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

  yield putRelayed(tabId, loadMapBlockset(primary, entity, Array.from(tilesData.pixels)));
}

export function* loadData({ id, type }) {
  invariant(
    type === 'map',
    `loadMapData can only load map entities, but it receieved a '${type}'`,
  );

  const { path: entityPath } = yield select(makeSelectEntity(type, id));
  return yield call(parseEntity, type, entityPath);
}

export function* loadMap({ id, action: { meta } }) {
  const entity = yield call(loadData, meta);

  // TODO: Set map data
  yield putRelayed(id, loadMapData(entity));

  // Load blockset assets
  // TODO: Make parallel
  yield call(loadBlockset, id, true, entity.data.blocksets.primary);
  yield call(loadBlockset, id, false, entity.data.blocksets.secondary);

  // TODO: Take a SAVE action for any of the loaded entities and trigger a reload
}

export function* loadMapSaga(tabId) {
  yield takeLatestRelayed(tabId, LOAD, loadMap);
}

// All sagas to be loaded
export default [
  loadMapSaga,
];
