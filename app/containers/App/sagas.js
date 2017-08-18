import path from 'path';
import { remote } from 'electron';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import fs from 'utils/fs';
import resourceSchemas from 'utils/schema';
import { addResource, loadProjectSuccess, loadProjectError } from './actions';
import { LOAD_PROJECT } from './constants';

export function parseResource(resourceType, resourcePath) {
  const validate = resourceSchemas[resourceType];

  // TODO: Selectively load JSON (we only need the meta data)
  return fs.readFileAsync(resourcePath, 'utf8').then((contents) => JSON.parse(contents)).then((contents) => {
    // TODO: async validate
    if (!validate(contents)) {
      // TODO: Custom exception type
      throw new Error(validate.errors[0].message);
    }

    return contents;
  });
}

export function findResources(resourceType, resourceDirectory) {
  return fs.readdirAsync(resourceDirectory).then((files) => files.map(
    (directory) => path.join(resourceDirectory, directory, `${resourceType}.json`),
  ).filter(
    (resourcePath) => fs.existsSync(resourcePath),
  ));
}

export function* loadResource(resourceType, resourcePath) {
  const resource = yield call(parseResource, resourceType, resourcePath);

  yield put(addResource(resourcePath, resource.meta));
}

export function* loadProjectResource(resourcePath) {
  yield call(loadResource, 'project', resourcePath);
}

export function* loadSingletonResource(resourceType, projectRoot) {
  const resourcePath = path.join(projectRoot, `${resourceType}.json`);
  yield call(loadResource, resourceType, resourcePath);
}

export function* loadResources(resourceType, resourceDirectory, projectRoot) {
  const resourcePaths = yield call(findResources, resourceType, path.join(projectRoot, resourceDirectory));
  yield all(resourcePaths.map((resourcePath) => call(loadResource, resourceType, resourcePath)));
}

export function* loadProjectResources(projectPath) {
  try {
    yield call(loadProjectResource, projectPath);

    const projectRoot = path.dirname(projectPath);

    // yield call(loadSingletonResource, 'banks', projectRoot);

    yield call(loadResources, 'map', 'maps', projectRoot);
    yield call(loadResources, 'blockset', 'blocksets', projectRoot);

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

  yield call(loadProjectResources, paths[0]);
}

export function* projectData() {
  yield takeLatest(LOAD_PROJECT, loadProject);
}

export default [
  projectData,
];
