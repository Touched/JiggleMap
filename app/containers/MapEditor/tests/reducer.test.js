import { mapDataReducer, mapEditingReducer } from '../reducer';

describe('mapDataReducer', () => {
  it('returns the initial state', () => {
    expect(mapDataReducer(undefined, {})).toMatchSnapshot();
  });
});

describe('mapEditingReducer', () => {
  it('returns the initial state', () => {
    expect(mapEditingReducer(undefined, {})).toMatchSnapshot();
  });
});
