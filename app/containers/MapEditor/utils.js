/* @flow */

import allTools from './tools';
import type { Tool } from './tools/types';

export function getToolById(id: string): ?Tool<*> {
  return allTools.find((tool: Tool<*>) => tool.id === id);
}
