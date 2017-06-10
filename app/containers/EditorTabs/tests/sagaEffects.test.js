import { take, takeEvery, takeLatest, throttle, put } from 'redux-saga/effects';

import {
  takeRelayed,
  takeLatestRelayed,
  takeEveryRelayed,
  throttleRelayed,
  putRelayed,
} from '../sagaEffects';
import { relayedMatcher } from '../sagaHelpers';
import { relayActionToTab } from '../actions';

jest.mock('../sagaHelpers', () => ({
  relayedMatcher: jest.fn(() => '*'),
}));

describe('takeRelayed', () => {
  it('creates a take effect', () => {
    expect(takeRelayed('8', 'ACTION')).toEqual(take('*'));
    expect(relayedMatcher).toHaveBeenCalledWith('8', 'ACTION');
  });
});

describe('throttleRelayed.maybe', () => {
  it('creates a takeLatest effect', () => {
    expect(takeRelayed.maybe('8', 'ACTION')).toEqual(take.maybe('*'));
    expect(relayedMatcher).toHaveBeenCalledWith('8', 'ACTION');
  });
});

describe('takeLatestRelayed', () => {
  it('creates a takeLatest effect', () => {
    const saga = () => {};
    expect(takeLatestRelayed('8', 'ACTION', saga, 1, 2, 3)).toEqual(takeLatest('*', saga, 1, 2, 3));
    expect(relayedMatcher).toHaveBeenCalledWith('8', 'ACTION');
  });
});

describe('takeEveryRelayed', () => {
  it('creates a takeLatest effect', () => {
    const saga = () => {};
    expect(takeEveryRelayed('8', 'ACTION', saga, 1, 2, 3)).toEqual(takeEvery('*', saga, 1, 2, 3));
    expect(relayedMatcher).toHaveBeenCalledWith('8', 'ACTION');
  });
});

describe('throttleRelayed', () => {
  it('creates a takeLatest effect', () => {
    const saga = () => {};
    const effect = throttleRelayed(100, '8', 'ACTION', saga, 1, 2, 3);

    expect(effect).toEqual(throttle(100, '*', saga, 1, 2, 3));
    expect(relayedMatcher).toHaveBeenCalledWith('8', 'ACTION');
  });
});

describe('putRelayed', () => {
  const action = {
    type: 'ACTION',
  };

  it('creates a put effect', () => {
    expect(putRelayed(action)).toEqual(put(relayActionToTab(action)));
  });
});

describe('putRelayed.resolve', () => {
  const action = {
    type: 'ACTION',
  };

  it('creates a put effect', () => {
    expect(putRelayed.resolve(action)).toEqual(put.resolve(relayActionToTab(action)));
  });
});
