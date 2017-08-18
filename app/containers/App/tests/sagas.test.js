import mock from 'mock-fs';
import { put, takeLatest, call, all } from 'redux-saga/effects';
import { remote } from 'electron';

import {
  parseResource,
  findResources,
  loadResource,
  loadProjectResource,
  loadSingletonResource,
  loadResources,
  loadProjectResources,
  loadProject,
  projectData,
} from '../sagas';
import { addResource, loadProjectSuccess, loadProjectError } from '../actions';
import { LOAD_PROJECT } from '../constants';

jest.mock('electron');

const projectResource = {
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
      'project.json': JSON.stringify(projectResource),
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

describe('parseResource', () => {
  it('reads the JSON data from the filesystem', async () => {
    await expect(parseResource('project', '/test/project.json')).resolves.toEqual(projectResource);
  });

  it('validates the resource according to the type', async () => {
    await expect(parseResource('map', '/test/project.json')).rejects.toBeDefined();
    await expect(parseResource('project', '/test/project.json')).resolves.toBeDefined();
  });
});

describe('findResources', () => {
  it('reads all the resources in a given directory', async () => {
    await expect(findResources('map', '/test/maps')).resolves.toEqual([
      '/test/maps/a/map.json',
      '/test/maps/b/map.json',
      '/test/maps/c/map.json',
    ]);
  });
});

describe('loadResource', () => {
  let generator;
  beforeEach(() => {
    generator = loadResource('project', '/test/project.json');
  });

  it('dispatches an action for the parsed resource', () => {
    const resource = generator.next().value;
    expect(resource).toEqual(call(parseResource, 'project', '/test/project.json'));

    const putDescriptor = generator.next(projectResource).value;
    expect(putDescriptor).toEqual(put(addResource('/test/project.json', projectResource.meta)));
  });
});

describe('loadProjectResource', () => {
  let generator;
  beforeEach(() => {
    generator = loadProjectResource('/test/project.json');
  });

  it('calls loadResource for the project.json', () => {
    const callDescriptor = generator.next().value;
    expect(callDescriptor).toEqual(call(loadResource, 'project', '/test/project.json'));
  });
});

describe('loadSingletonResource', () => {
  let generator;
  beforeEach(() => {
    generator = loadSingletonResource('singleton', '/test');
  });

  it('calls loadResource for the given singleton resource relative to the project root', () => {
    const callDescriptor = generator.next().value;
    expect(callDescriptor).toEqual(call(loadResource, 'singleton', '/test/singleton.json'));
  });
});

describe('loadResources', () => {
  let generator;
  beforeEach(() => {
    generator = loadResources('map', 'maps', '/test');
  });

  it('calls loadResource for every resource returned by findResources', () => {
    const callDescriptor = generator.next().value;
    expect(callDescriptor).toEqual(call(findResources, 'map', '/test/maps'));

    const paths = ['/test/maps/a/map.json', '/test/maps/b/map.json'];
    const allDescriptor = generator.next(paths).value;
    const expected = all(paths.map((path) => call(loadResource, 'map', path)));
    expect(allDescriptor).toEqual(expected);
  });
});

describe('loadProjectResources', () => {
  let generator;
  beforeEach(() => {
    generator = loadProjectResources('/test/project.json');
  });

  it('loads all the correct resources and dispatches a success action', () => {
    expect(generator.next().value).toEqual(call(loadProjectResource, '/test/project.json'));
    expect(generator.next().value).toEqual(call(loadResources, 'map', 'maps', '/test'));
    expect(generator.next().value).toEqual(call(loadResources, 'blockset', 'blocksets', '/test'));
    expect(generator.next().value).toEqual(put(loadProjectSuccess()));
  });

  it('dispatches an error action if the resources failed to load', () => {
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
    expect(callDescriptor).toEqual(call(loadProjectResources, '/path/to/project.json'));
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
