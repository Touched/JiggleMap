import { take, takeEvery, takeLatest, throttle, put } from 'redux-saga/effects';

import { relayedMatcher } from './sagaHelpers';
import { relayActionToTab } from './actions';

export function takeRelayed(idPattern, pattern) {
  return take(relayedMatcher(idPattern, pattern));
}

takeRelayed.maybe = (idPattern, pattern) => take.maybe(relayedMatcher(idPattern, pattern));

export function takeLatestRelayed(idPattern, pattern, saga, ...args) {
  return takeLatest(relayedMatcher(idPattern, pattern), saga, ...args);
}

export function takeEveryRelayed(idPattern, pattern, saga, ...args) {
  return takeEvery(relayedMatcher(idPattern, pattern), saga, ...args);
}

export function throttleRelayed(ms, idPattern, pattern, saga, ...args) {
  return throttle(ms, relayedMatcher(idPattern, pattern), saga, ...args);
}

export function putRelayed(action) {
  return put(relayActionToTab(action));
}

putRelayed.resolve = (action) => put.resolve(relayActionToTab(action));
