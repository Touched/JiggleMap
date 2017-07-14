
import combineTabReducers, { newTabState } from '../reducer';

import {
  switchTab,
  newTab,
  closeTab,
  reorderTabs,
  relayActionToTab,
  loadTab,
} from '../actions';

describe('combinedTabsReducers', () => {
  const INCREMENT = 'test/counter/INCREMENT';
  const DECREMENT = 'test/counter/INCREMENT';

  const counter = (state = 0, action) => {
    switch (action.type) {
      case INCREMENT:
        return state + 1;
      case DECREMENT:
        return state - 1;
      default:
        return state;
    }
  };

  const reducer = combineTabReducers({
    counter,
  });

  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toMatchSnapshot();
  });

  describe('RELAY_ACTION_TO_TAB', () => {
    it('passes all actions through to the specified child reducer', () => {
      const counterTab = {
        kind: 'counter',
      };

      const state = {
        active: '2',
        tabs: ['0', '2'],
        byId: {
          0: counterTab,
          2: counterTab,
        },
      };

      const newState = reducer(state, relayActionToTab('0', { type: INCREMENT }));

      expect(newState.byId['2'].state).not.toBeDefined();
      expect(newState.byId['0'].state).toEqual(1);
    });
  });

  describe('NEW_TAB', () => {
    it('creates a new tab', () => {
      const state = reducer(undefined, newTab());

      expect(state).toEqual({
        active: '1',
        nextId: '2',
        tabs: ['0', '1'],
        byId: {
          0: newTabState,
          1: newTabState,
        },
      });
    });
  });

  describe('REORDER_TABS', () => {
    const state = {
      active: '2',
      tabs: ['0', '2', '4'],
      byId: {
        0: newTabState,
        2: newTabState,
        4: newTabState,
      },
    };

    it('sets the order', () => {
      const newState = reducer(state, reorderTabs(['2', '0', '4']));
      expect(newState.tabs).toEqual(['2', '0', '4']);
    });

    it('ignores updates that have missing keys', () => {
      const reorder = (order) => reducer(state, reorderTabs(order));
      expect(reorder(['2', '4']).tabs).toEqual(['0', '2', '4']);
      expect(reorder(['2', '4', '4']).tabs).toEqual(['0', '2', '4']);
    });
  });

  describe('CLOSE_TAB', () => {
    const state = {
      active: '2',
      tabs: ['0', '2', '4'],
      byId: {
        0: newTabState,
        2: newTabState,
        4: newTabState,
      },
    };

    it('can remove the specified inactive tab from the list', () => {
      const newState = reducer(state, closeTab('0'));

      expect(newState.active).toEqual('2');
      expect(newState.tabs).toEqual(['2', '4']);
      expect(newState.byId).toEqual({ 2: newTabState, 4: newTabState });
    });

    it('moves to the tab on the right if closing an active tab', () => {
      const newState = reducer(state, closeTab('2'));

      expect(newState.active).toEqual('4');
      expect(newState.tabs).toEqual(['0', '4']);
      expect(newState.byId).toEqual({ 0: newTabState, 4: newTabState });
    });

    it('moves to the tab on the left if closing an active tab on the far right', () => {
      const newState = reducer({ ...state, active: '4' }, closeTab('4'));

      expect(newState.active).toEqual('2');
      expect(newState.tabs).toEqual(['0', '2']);
      expect(newState.byId).toEqual({ 0: newTabState, 2: newTabState });
    });

    it('ignores invalid tab ids', () => {
      const newState = reducer(state, closeTab('3'));
      expect(newState).toEqual(state);
    });

    it('can close all the tabs', () => {
      const newState = reducer({
        active: '0',
        tabs: ['0'],
        byId: {
          0: newTabState,
        },
      }, closeTab('0'));

      expect(newState.active).toEqual(null);
      expect(newState.tabs).toEqual([]);
      expect(newState.byId).toEqual({});
    });
  });

  describe('SWITCH_TAB', () => {
    const state = {
      active: '2',
      tabs: ['0', '2', '4'],
      byId: {
        0: newTabState,
        2: newTabState,
        4: newTabState,
      },
    };

    it('changes the active tab', () => {
      const newState = reducer(state, switchTab('4'));
      expect(newState.active).toEqual('4');
    });

    it('does not change to an invalid tab id', () => {
      const newState = reducer(state, switchTab('5'));
      expect(newState.active).toEqual('2');
    });
  });

  describe('LOAD_TAB', () => {
    const state = {
      nextId: '10',
      active: '2',
      tabs: ['0', '2', '4'],
      byId: {
        0: newTabState,
        2: newTabState,
        4: newTabState,
      },
    };

    it('changes the active tab', () => {
      const newState = reducer(state, loadTab('counter', { title: 'Test' }));
      expect(newState.byId['2'].kind).toEqual('counter');
      expect(newState.byId['2'].title).toEqual('Test');
      expect(newState.byId['2'].state).toEqual(0);
    });

    it('can open a new tab', () => {
      const newState = reducer(state, loadTab('counter', { title: 'Test' }, true, false));
      expect(newState.byId['10'].kind).toEqual('counter');
      expect(newState.nextId).toEqual('11');
      expect(newState.byId['10'].title).toEqual('Test');
      expect(newState.active).toEqual('2');
    });

    it('focuses the active tab if told to', () => {
      const newState = reducer(state, loadTab('counter', {}, true, true));
      expect(newState.byId['10'].kind).toEqual('counter');
      expect(newState.nextId).toEqual('11');
      expect(newState.active).toEqual('10');
    });

    it('opens a new tab if there is no active tab', () => {
      const noTabState = {
        nextId: '11',
        active: null,
        tabs: [],
        byId: {},
      };

      const newState = reducer(noTabState, loadTab('counter', { title: 'Test' }));
      expect(newState.byId['11'].kind).toEqual('counter');
      expect(newState.nextId).toEqual('12');
      expect(newState.byId['11'].title).toEqual('Test');
      expect(newState.active).toEqual('11');
    });
  });
});
