import createTabMiddleware from '../sagaMiddleware';
import { relayActionToTab, load, loadTab, closeTab } from '../actions';

describe('createTabMiddleware', () => {
  const fooSaga = jest.fn();
  const barSaga = jest.fn();

  const sagasByTabType = {
    foo: [fooSaga],
    bar: [barSaga],
  };

  const activeTabId = '9';
  const nextTabId = '11';

  const state = {
    editorTabs: {
      active: activeTabId,
      nextId: nextTabId,
      byId: {
        9: {},
      },
    },
  };

  const runSaga = jest.fn();

  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(),
  };

  const middleware = createTabMiddleware(sagasByTabType)(runSaga);

  it('registers sagas when the tab type is changed', () => {
    const next = jest.fn();
    const action = loadTab('foo');
    middleware(store)(next)(action);

    expect(runSaga).toHaveBeenCalledWith(fooSaga, activeTabId);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('loading a tab dispatches a load action', () => {
    const next = jest.fn();
    const meta = 'metadata';
    const action = loadTab('foo', { meta });
    middleware(store)(next)(action);

    expect(store.dispatch).toHaveBeenCalledWith(relayActionToTab(activeTabId, load('foo', meta)));
  });

  it('registers sagas when the tab type is changed in a new tab', () => {
    const next = jest.fn();
    const action = loadTab('foo', {}, true);
    middleware(store)(next)(action);

    expect(runSaga).toHaveBeenCalledWith(fooSaga, nextTabId);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('registers sagas when the tab type and there is no active tab', () => {
    const noTabState = {
      editorTabs: {
        active: null,
        nextId: nextTabId,
      },
    };

    store.getState.mockImplementationOnce(() => noTabState);

    const next = jest.fn();
    const action = loadTab('foo');
    middleware(store)(next)(action);

    expect(runSaga).toHaveBeenLastCalledWith(fooSaga, nextTabId);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('cancels the saga if the tab closes', () => {
    const appliedMiddleware = middleware(store);
    const next = jest.fn();

    const task = {
      isRunning: () => true,
      cancel: jest.fn(),
    };
    runSaga.mockImplementation(() => task);

    appliedMiddleware(next)(loadTab('foo'));

    const action = closeTab(activeTabId);
    appliedMiddleware(next)(action);

    expect(task.cancel).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  it('cancels sagas when resetting the tab type', () => {
    const appliedMiddleware = middleware(store);
    const next = jest.fn();

    const task = {
      isRunning: () => true,
      cancel: jest.fn(),
    };
    runSaga.mockImplementation(() => task);

    appliedMiddleware(next)(loadTab('foo'));

    const action = loadTab('bar');
    appliedMiddleware(next)(action);

    expect(task.cancel).toHaveBeenCalled();
    expect(runSaga).toHaveBeenCalledWith(fooSaga, activeTabId);
    expect(next).toHaveBeenCalledWith(action);
  });
});
