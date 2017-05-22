import path from 'path';
import { remote } from 'electron';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import fs from 'utils/fs';
import entitySchemas from 'utils/schema';
import { addEntity, loadProjectSuccess, loadProjectError } from './actions';
import { LOAD_PROJECT } from './constants';

export function parseEntity(entityType, entityPath) {
  const validate = entitySchemas[entityType];

  // TODO: Selectively load JSON (we only need the meta data)
  return fs.readFileAsync(entityPath, 'utf8').then((contents) => JSON.parse(contents)).then((contents) => {
    // TODO: async validate
    if (!validate(contents)) {
      // TODO: Custom exception type
      throw new Error(validate.errors[0].message);
    }

    return contents;
  });
}

export function findEntities(entityType, entityDirectory) {
  return fs.readdirAsync(entityDirectory).then((files) => files.map(
    (directory) => path.join(entityDirectory, directory, `${entityType}.json`),
  ).filter(
    (entityPath) => fs.existsSync(entityPath),
  ));
}

export function* loadEntity(entityType, entityPath) {
  const entity = yield call(parseEntity, entityType, entityPath);

  yield put(addEntity(entityPath, entity.meta));
}

export function* loadProjectEntity(entityPath) {
  yield call(loadEntity, 'project', entityPath);
}

export function* loadSingletonEntity(entityType, projectRoot) {
  const entityPath = path.join(projectRoot, `${entityType}.json`);
  yield call(loadEntity, entityType, entityPath);
}

export function* loadEntities(entityType, entityDirectory, projectRoot) {
  const entityPaths = yield call(findEntities, entityType, path.join(projectRoot, entityDirectory));
  yield all(entityPaths.map((entityPath) => call(loadEntity, entityType, entityPath)));
}

export function* loadProjectEntities(projectPath) {
  try {
    yield call(loadProjectEntity, projectPath);

    const projectRoot = path.dirname(projectPath);

    // yield call(loadSingletonEntity, 'banks', projectRoot);

    yield call(loadEntities, 'map', 'maps', projectRoot);

    yield put(loadProjectSuccess());
  } catch (err) {
    yield put(loadProjectError(err));
  }
}

export function* loadProject() {
  const paths = remote.dialog.showOpenDialog({
    title: 'Open a Project',
    filters: [{
      name: 'Project Files',
      extensions: ['json'],
    }],
    properties: ['openFile'],
  });

  if (!paths || !paths.length) {
    return;
  }

  yield call(loadProjectEntities, paths[0]);
}

export function* projectData() {
  yield takeLatest(LOAD_PROJECT, loadProject);
}

export default [
  projectData,
];
