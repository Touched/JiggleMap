import makeSelectEditorTabs, {
  makeSelectEditorTabsActiveIndex,
  makeSelectEditorTabsActive,
  makeSelectEditorTabsTab,
} from '../selectors';

describe('makeSelectEditorTabsActiveIndex', () => {
  const selector = makeSelectEditorTabsActiveIndex();

  it('returns the active tab index', () => {
    expect(selector({ editorTabs: { active: '10' } })).toEqual('10');
  });
});

describe('makeSelectEditorTabsActive', () => {
  const selector = makeSelectEditorTabsActive({
    tab: ['tab', 'state'],
  });

  it('returns the active tab data with id populated', () => {
    const state = {
      editorTabs: {
        active: '5',
        byId: {
          5: {
            kind: 'tab',
            state: 'data',
          },
        },
      },
    };

    expect(selector(state)).toEqual({
      id: '5',
      kind: 'tab',
      state: 'data',
    });
  });

  it('returns null if there is no active tab', () => {
    const state = {
      editorTabs: { active: null },
    };

    expect(selector(state)).toEqual(null);
  });
});

describe('makeSelectEditorTabsTab', () => {
  const selector = makeSelectEditorTabsTab('5');

  const state = {
    editorTabs: {
      byId: {
        5: {
          kind: 'tab',
          state: 'data',
        },
      },
    },
  };

  it('returns a tab with specified with the id populated', () => {
    expect(selector(state)).toEqual({
      id: '5',
      kind: 'tab',
      state: 'data',
    });
  });
});

describe('makeSelectEditorTabs', () => {
  const selector = makeSelectEditorTabs();

  it('returns an array of tab data with ids', () => {
    const state = {
      active: '5',
      tabs: ['8', '5'],
      byId: {
        5: {
          kind: 'tab',
          state: null,
        },
        8: {
          kind: 'tab',
          state: null,
        },
      },
    };

    const expected = [{
      id: '8',
      kind: 'tab',
      state: null,
    }, {
      id: '5',
      kind: 'tab',
      state: null,
    }];

    expect(selector({ editorTabs: state })).toEqual(expected);
  });

  it('returns an empty array if there are no tabs', () => {
    const state = {
      active: null,
      tabs: [],
      byId: {},
    };

    expect(selector({ editorTabs: state })).toEqual([]);
  });
});
