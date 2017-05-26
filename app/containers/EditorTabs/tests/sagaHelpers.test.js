import { matcher, idMatcher, relayedMatcher } from '../sagaHelpers';
import { relayActionToTab } from '../actions';

describe('matcher', () => {
  it('matches wildcards', () => {
    expect(matcher('*')('anything')).toBe(true);
  });

  it('matches a string or symbol', () => {
    const symbol = Symbol('symbol');
    const string = 'string';

    expect(matcher(string)({ type: string })).toBe(true);
    expect(matcher(string)({ type: 'notstring' })).toBe(false);
    expect(matcher(symbol)({ type: symbol })).toBe(true);
    expect(matcher(symbol)({ type: Symbol('symbol') })).toBe(false);
  });

  it('matches stringable functions', () => {
    function stringableFunction() {}
    stringableFunction.toString = () => 'test';
    expect(matcher(stringableFunction)({ type: 'test' })).toBe(true);
  });

  it('matches predicates', () => {
    const predicate = (x) => x !== 1;

    expect(matcher(predicate)(1)).toBe(false);
    expect(matcher(predicate)(2)).toBe(true);
    expect(matcher(predicate)(3)).toBe(true);
  });

  it('matches arrays', () => {
    const array = ['a', 'b', 'c'];

    expect(matcher(array)({ type: 'a' })).toBe(true);
    expect(matcher(array)({ type: 'b' })).toBe(true);
    expect(matcher(array)({ type: 'c' })).toBe(true);
    expect(matcher(array)({ type: 'd' })).toBe(false);
  });
});

describe('idMatcher', () => {
  it('matches wildcards', () => {
    expect(idMatcher('*')('anything')).toBe(true);
  });

  it('matches a string id', () => {
    const string = '123';

    expect(idMatcher(string)('123')).toBe(true);
    expect(idMatcher(string)('124')).toBe(false);
  });

  it('matches a predicate id', () => {
    const predicate = (x) => x !== '123';

    expect(idMatcher(predicate)('124')).toBe(true);
    expect(idMatcher(predicate)('122')).toBe(true);
    expect(idMatcher(predicate)('123')).toBe(false);
  });

  it('matches an id array', () => {
    const array = ['1', '2', '3'];

    expect(idMatcher(array)('1')).toBe(true);
    expect(idMatcher(array)('2')).toBe(true);
    expect(idMatcher(array)('3')).toBe(true);
    expect(idMatcher(array)('4')).toBe(false);
  });
});

describe('relayedMatcher', () => {
  it('matches a relayed action only for the given tab', () => {
    const array = ['a', 'b'];

    expect(relayedMatcher('1', array)(relayActionToTab('1', { type: 'a' }))).toBe(true);
    expect(relayedMatcher('1', array)(relayActionToTab('2', { type: 'a' }))).toBe(false);
    expect(relayedMatcher('1', array)(relayActionToTab('1', { type: 'c' }))).toBe(false);
  });
});
