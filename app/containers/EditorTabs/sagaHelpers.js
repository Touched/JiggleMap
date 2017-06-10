import { RELAY_ACTION_TO_TAB } from './constants';

/* Adapted from redux-saga */
const { hasOwnProperty } = Object.prototype;
const isNotUndef = (v) => v !== null && v !== undefined;
const isFunc = (f) => typeof f === 'function';
const isStringableFunc = (f) => isFunc(f) && hasOwn(f, 'toString');
const isArray = Array.isArray;
const hasOwn = (object, property) => isNotUndef(object) && hasOwnProperty.call(object, property);

const matchers = {
  wildcard: () => () => true,
  default: (pattern) =>
    typeof pattern === 'symbol' ? (input) => input.type === pattern : (input) => input.type === String(pattern),
  array: (patterns) => {
    const matcherFuncs = patterns.map(matcher);
    return (input) => matcherFuncs.some((m) => m(input));
  },
  predicate: (predicate) => (input) => predicate(input),
};

export function matcher(pattern) {
  if (pattern === '*') {
    return matchers.wildcard(pattern);
  } else if (isArray(pattern)) {
    return matchers.array(pattern);
  } else if (isStringableFunc(pattern)) {
    return matchers.default(pattern);
  } else if (isFunc(pattern)) {
    return matchers.predicate(pattern);
  }

  return matchers.default(pattern);
}

export function idMatcher(pattern) {
  if (pattern === '*') {
    return () => true;
  } else if (isArray(pattern)) {
    const matcherFuncs = pattern.map(idMatcher);
    return (input) => matcherFuncs.some((m) => m(input));
  } else if (isFunc(pattern)) {
    return (input) => pattern(input);
  }

  return (input) => input === pattern;
}

export function relayedMatcher(idPattern, pattern) {
  const matchAction = matcher(pattern);
  const matchId = idMatcher(idPattern);
  return ({ type, id, action }) => type === RELAY_ACTION_TO_TAB && matchId(id) && matchAction(action);
}
