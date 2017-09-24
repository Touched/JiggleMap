/* @flow */

import allTools from './tools';
import type { Tool } from './tools/types';

export function getToolById(id: string): ?Tool<*> {
  return Object.values((allTools: { [string]: Tool<*> })).find((tool: Tool<*>) => tool.id === id);
}
