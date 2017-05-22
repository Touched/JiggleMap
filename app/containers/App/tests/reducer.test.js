import { Map } from 'immutable';

import { loadProject, loadProjectSuccess, loadProjectError } from '../actions';
import projectReducer, { ProjectState } from '../reducer';

describe('projectReducer', () => {
  it('returns the initial state', () => {
    expect(projectReducer(undefined, {})).toMatchSnapshot();
  });

  it('loading the project sets the boolean and resets the state', () => {
    const initialState = ProjectState({
      path: '/path/to/project.json',
      entities: Map({
        key: 'value',
      }),
    });

    const state = projectReducer(initialState, loadProject('/path/to/project.json'));

    expect(state).toEqual(ProjectState({
      error: false,
      loading: true,
      path: '/path/to/project.json',
      map: Map(),
    }));
  });

  it('resets the project state after an error', () => {
    const initialState = ProjectState({
      path: '/path/to/project.json',
      entities: Map({
        key: 'value',
      }),
    });

    const state = projectReducer(initialState, loadProjectError());

    expect(state).toEqual(ProjectState({
      error: true,
      loading: false,
      path: null,
      map: Map(),
    }));
  });

  it('resets the loading state after sucess', () => {
    const initialState = ProjectState({
      path: '/path/to/project.json',
      entities: Map({
        key: 'value',
      }),
      loading: true,
    });

    const state = projectReducer(initialState, loadProjectSuccess());

    expect(state).toEqual(state.set('loading', false));
  });
});
