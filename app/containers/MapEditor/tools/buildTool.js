/* @flow */

import type { Tool } from './types';

export default function buildTool<State>(defintion: $Shape<Tool<State>>): Tool<State> {
  return {
    reducer(state: State) {
      return state;
    },
    onMouseDown() {},
    onMouseMove() {},
    onMouseUp() {},
    getCursorForObject() {
      return 'auto';
    },
    ...defintion,
  };
}
