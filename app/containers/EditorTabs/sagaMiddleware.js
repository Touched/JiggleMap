import { LOAD_TAB, CLOSE_TAB } from './constants';
import { makeSelectEditorTabsNextId, makeSelectEditorTabsActiveIndex } from './selectors';
import { load, relayActionToTab } from './actions';

const createTabMiddleware = (sagasByType) => (runSaga) => (store) => {
  const tasksByTabId = {};

  const selectNextId = makeSelectEditorTabsNextId();
  const selectActiveIndex = makeSelectEditorTabsActiveIndex();

  function runSagas(sagas = [], tabId) {
    return sagas.map((saga) => runSaga(saga, tabId));
  }

  function cancelSagas(tasks = []) {
    return tasks.map((task) => task.cancel());
  }

  function loadTab({ kind, forceNewTab }) {
    const state = store.getState();
    const activeId = selectActiveIndex(state);
    const nextId = selectNextId(state);
    const id = forceNewTab ? nextId : activeId || nextId;

    cancelSagas(tasksByTabId[id]);
    tasksByTabId[id] = runSagas(sagasByType[kind], id);

    return id;
  }

  return (next) => (action) => {
    switch (action.type) {
      case LOAD_TAB:
        store.dispatch(relayActionToTab(loadTab(action), load(action.kind, action.meta)));
        break;
      case CLOSE_TAB:
        cancelSagas(tasksByTabId[action.id]);
        break;

      // no default
    }

    return next(action);
  };
};

export default createTabMiddleware;
