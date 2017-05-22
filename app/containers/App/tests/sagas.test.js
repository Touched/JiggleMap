import mock from 'mock-fs';
import { put, takeLatest, call, all } from 'redux-saga/effects';
import { remote } from 'electron';

import {
  parseEntity,
  findEntities,
  loadEntity,
  loadProjectEntity,
  loadSingletonEntity,
  loadEntities,
  loadProjectEntities,
  loadProject,
  projectData,
} from '../sagas';
import { addEntity, loadProjectSuccess, loadProjectError } from '../actions';
import { LOAD_PROJECT } from '../constants';

jest.mock('electron');

const projectEntity = {
  meta: {
    format: {
      type: 'project',
      version: '1.0.0',
    },
    id: 'project',
  },
  data: {
    banks: [],
  },
};

beforeEach(async () => {
  // Creates an in-memory file system
  mock({
    '/test': {
      'project.json': JSON.stringify(projectEntity),
      maps: {
        a: {
          'map.json': '',
        },
        b: {
          'map.json': '',
        },
        c: {
          'map.json': '',
        },
        somefile: 'not a map',
      },
    },
  });
});

afterEach(async () => {
  mock.restore();
});

describe('parseEntity', () => {
  it('reads the JSON data from the filesystem', async () => {
    await expect(parseEntity('project', '/test/project.json')).resolves.toEqual(projectEntity);
  });

  it('validates the entity according to the type', async () => {
    await expect(parseEntity('map', '/test/project.json')).rejects.toBeDefined();
    await expect(parseEntity('project', '/test/project.json')).resolves.toBeDefined();
  });
});

describe('findEntities', () => {
  it('reads all the entities in a given directory', async () => {
    await expect(findEntities('map', '/test/maps')).resolves.toEqual([
      '/test/maps/a/map.json',
      '/test/maps/b/map.json',
      '/test/maps/c/map.json',
    ]);
  });
});

describe('loadEntity', () => {
  let generator;
  beforeEach(() => {
    generator = loadEntity('project', '/test/project.json');
  });

  it('dispatches an action for the parsed entity', () => {
    const entity = generator.next().value;
    expect(entity).toEqual(call(parseEntity, 'project', '/test/project.json'));

    const putDescriptor = generator.next(projectEntity).value;
    expect(putDescriptor).toEqual(put(addEntity('/test/project.json', projectEntity.meta)));
  });
});

describe('loadProjectEntity', () => {
  let generator;
  beforeEach(() => {
    generator = loadProjectEntity('/test/project.json');
  });

  it('calls loadEntity for the project.json', () => {
    const callDescriptor = generator.next().value;
    expect(callDescriptor).toEqual(call(loadEntity, 'project', '/test/project.json'));
  });
});

describe('loadSingletonEntity', () => {
  let generator;
  beforeEach(() => {
    generator = loadSingletonEntity('singleton', '/test');
  });

  it('calls loadEntity for the given singleton entity relative to the project root', () => {
    const callDescriptor = generator.next().value;
    expect(callDescriptor).toEqual(call(loadEntity, 'singleton', '/test/singleton.json'));
  });
});

describe('loadEntities', () => {
  let generator;
  beforeEach(() => {
    generator = loadEntities('map', 'maps', '/test');
  });

  it('calls loadEntity for every entity returned by findEntities', () => {
    const callDescriptor = generator.next().value;
    expect(callDescriptor).toEqual(call(findEntities, 'map', '/test/maps'));

    const paths = ['/test/maps/a/map.json', '/test/maps/b/map.json'];
    const allDescriptor = generator.next(paths).value;
    const expected = all(paths.map((path) => call(loadEntity, 'map', path)));
    expect(allDescriptor).toEqual(expected);
  });
});

describe('loadProjectEntities', () => {
  let generator;
  beforeEach(() => {
    generator = loadProjectEntities('/test/project.json');
  });

  it('loads all the correct entities and dispatches a success action', () => {
    expect(generator.next().value).toEqual(call(loadProjectEntity, '/test/project.json'));
    expect(generator.next().value).toEqual(call(loadEntities, 'map', 'maps', '/test'));
    expect(generator.next().value).toEqual(put(loadProjectSuccess()));
  });

  it('dispatches an error action if the entities failed to load', () => {
    generator.next();
    const response = new Error('An error');
    const putDescriptor = generator.throw(response).value;
    expect(putDescriptor).toEqual(put(loadProjectError(response)));
  });
});

describe('loadProject', () => {
  let generator;
  beforeEach(() => {
    generator = loadProject();
  });

  it('retrieves the first path from the input dialog', () => {
    remote.dialog.showOpenDialog.mockImplementation(() => [
      '/path/to/project.json',
    ]);

    const callDescriptor = generator.next().value;
    expect(callDescriptor).toEqual(call(loadProjectEntities, '/path/to/project.json'));
  });

  it('does nothing if no file was selected', () => {
    remote.dialog.showOpenDialog.mockImplementation(() => []);
    expect(generator.next().done).toBe(true);
  });
});

describe('projectData', () => {
  let generator;
  beforeEach(() => {
    generator = projectData();
  });

  it('watches for LOAD_PROJECT', () => {
    const takeLatestDescriptor = generator.next().value;
    expect(takeLatestDescriptor).toEqual(takeLatest(LOAD_PROJECT, loadProject));
  });
});
