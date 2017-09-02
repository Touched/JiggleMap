/* @flow */

import type { Tool } from './types';

export default function buildTool<State>(defintion: $Shape<Tool<State>>): Tool<State> {
  return {
    getCursorForObject() {
      return 'auto';
    },
    ...defintion,
  };
}
