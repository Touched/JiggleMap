import { loadProject, loadProjectSuccess, loadProjectError, addEntity } from '../actions';
import projectReducer from '../reducer';

describe('projectReducer', () => {
  it('returns the initial state', () => {
    expect(projectReducer(undefined, {})).toMatchSnapshot();
  });

  it('loading the project sets the boolean and resets the state', () => {
    const initialState = {
      path: '/path/to/project.json',
      entities: {
        key: 'value',
      },
    };

    const state = projectReducer(initialState, loadProject('/path/to/project.json'));

    expect(state).toEqual({
      error: false,
      loading: true,
      path: '/path/to/project.json',
      entities: {},
    });
  });

  it('resets the project state after an error', () => {
    const initialState = {
      path: '/path/to/project.json',
      entities: {
        key: 'value',
      },
    };

    const state = projectReducer(initialState, loadProjectError());

    expect(state).toEqual({
      error: true,
      loading: false,
      path: null,
      entities: {},
    });
  });

  it('can add a new entity to the list', () => {
    const initialState = {
      entities: {},
    };

    const state = projectReducer(initialState, addEntity('/path/to/entity.json', {
      format: {
        type: 'foo',
      },
      id: 'bar',
      name: 'test entity',
      description: 'this is a test entity',
    }));

    expect(state.entities).toEqual({
      foo: {
        bar: {
          id: 'bar',
          type: 'foo',
          icon: null,
          path: '/path/to/entity.json',
          name: 'test entity',
          description: 'this is a test entity',
        },
      },
    });
  });

  it('can add an entity to the list', () => {
    const initialState = {
      entities: {
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

    const state = projectReducer(initialState, addEntity('/path/to/entity.json', {
      format: {
        type: 'foo',
      },
      id: 'bar',
      name: 'test entity',
      description: 'this is a test entity',
    }));

    expect(state.entities).toEqual({
      foo: {
        bar: {
          id: 'bar',
          type: 'foo',
          icon: null,
          path: '/path/to/entity.json',
          name: 'test entity',
          description: 'this is a test entity',
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
      entities: {
        key: 'value',
      },
      loading: true,
    };

    const state = projectReducer(initialState, loadProjectSuccess());

    expect(state).toEqual({ ...state, loading: false });
  });
});
