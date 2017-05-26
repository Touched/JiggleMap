
import mapEditorReducer from '../reducer';

describe('mapEditorReducer', () => {
  it('returns the initial state', () => {
    expect(mapEditorReducer(undefined, {})).toMatchSnapshot();
  });
});
