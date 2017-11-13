/* @flow */

import { ActionCreators } from 'redux-undo';

import lineTool from './lineTool';
import autoBlockTool from './autoBlockTool';
import dragConnectionTool from './dragConnectionTool';
import pointerTool from './pointerTool';

const undoTool = {
  id: 'undo-tool',
  type: 'action',
  name: 'Undo',
  description: '',
  layers: ['map', 'collision', 'height', 'entities'],
  icon: 'undo',
  action: ActionCreators.undo,
};

const redoTool = {
  id: 'redo-tool',
  type: 'action',
  name: 'Redo',
  description: '',
  layers: ['map', 'collision', 'height', 'entities'],
  icon: 'redo',
  action: ActionCreators.redo,
};

export default [
  pointerTool,
  dragConnectionTool,
  lineTool,
  autoBlockTool,
  undoTool,
  redoTool,
];
