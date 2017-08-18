import { loadProject, loadProjectSuccess, loadProjectError, addResource } from '../actions';
import projectReducer from '../reducer';

describe('projectReducer', () => {
  it('returns the initial state', () => {
    expect(projectReducer(undefined, {})).toMatchSnapshot();
  });

  it('loading the project sets the boolean and resets the state', () => {
    const initialState = {
      path: '/path/to/project.json',
      resources: {
        key: 'value',
      },
    };

    const state = projectReducer(initialState, loadProject('/path/to/project.json'));

    expect(state).toEqual({
      error: false,
      loading: true,
      path: '/path/to/project.json',
      resources: {},
    });
  });

  it('resets the project state after an error', () => {
    const initialState = {
      path: '/path/to/project.json',
      resources: {
        key: 'value',
      },
    };

    const state = projectReducer(initialState, loadProjectError());

    expect(state).toEqual({
      error: true,
      loading: false,
      path: null,
      resources: {},
    });
  });

  it('can add a new resource to the list', () => {
    const initialState = {
      resources: {},
    };

    const state = projectReducer(initialState, addResource('/path/to/resource.json', {
      format: {
        type: 'foo',
      },
      id: 'bar',
      name: 'test resource',
      description: 'this is a test resource',
    }));

    expect(state.resources).toEqual({
      foo: {
        bar: {
          id: 'bar',
          type: 'foo',
          icon: null,
          path: '/path/to/resource.json',
          name: 'test resource',
          description: 'this is a test resource',
        },
      },
    });
  });

  it('can add an resource to the list', () => {
    const initialState = {
      resources: {
        foo: {
          baz: {
            id: 'baz',
          },
        },
        quux: {
          foo: {
            id: 'foo',
          },
        },
      },
    };

    const state = projectReducer(initialState, addResource('/path/to/resource.json', {
      format: {
        type: 'foo',
      },
      id: 'bar',
      name: 'test resource',
      description: 'this is a test resource',
    }));

    expect(state.resources).toEqual({
      foo: {
        bar: {
          id: 'bar',
          type: 'foo',
          icon: null,
          path: '/path/to/resource.json',
          name: 'test resource',
          description: 'this is a test resource',
        },
        baz: {
          id: 'baz',
        },
      },
      quux: {
        foo: {
          id: 'foo',
        },
      },
    });
  });

  it('resets the loading state after sucess', () => {
    const initialState = {
      path: '/path/to/project.json',
      resources: {
        key: 'value',
      },
      loading: true,
    };

    const state = projectReducer(initialState, loadProjectSuccess());

    expect(state).toEqual({ ...state, loading: false });
  });
});
