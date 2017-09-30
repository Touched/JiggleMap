/* @flow */

import React from 'react';
import { ActionCreators } from 'redux-undo';
import UndoIcon from 'mdi-react/UndoIcon';
import RedoIcon from 'mdi-react/RedoIcon';

import lineTool from './lineTool';
import autoBlockTool from './autoBlockTool';

const undoTool = {
  id: 'undo-tool',
  type: 'action',
  name: 'Undo',
  description: '',
  layers: ['map', 'collision', 'height', 'entities'],
  icon: <UndoIcon />,
  action: ActionCreators.undo,
};

const redoTool = {
  id: 'redo-tool',
  type: 'action',
  name: 'Redo',
  description: '',
  layers: ['map', 'collision', 'height', 'entities'],
  icon: <RedoIcon />,
  action: ActionCreators.redo,
};

export default [
  lineTool,
  autoBlockTool,
  undoTool,
  redoTool,
];
