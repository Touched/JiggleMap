/* @flow */

import lineTool from './lineTool';
import type { Tool } from './types';

const allTools: { [string]: Tool<*> } = {
  lineTool,
};

export default allTools;
