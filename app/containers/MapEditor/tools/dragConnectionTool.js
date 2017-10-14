import React from 'react';
import CursorMoveIcon from 'mdi-react/CursorMoveIcon';

import createDraggingTool from './createDraggingTool';
import { moveConnection, commitConnectionMove } from '../actions';


export default createDraggingTool({
  id: 'drag-connection-tool',
  name: 'Drag',
  description: '',
  layers: ['map'],
  icon: <CursorMoveIcon />,
  component: null,
  handlesType(type) {
    return type === 'connected-map';
  },
  onDrag(object, position, state, tabDispatch) {
    const { x, y } = state.dragging.startingPosition;
    tabDispatch(moveConnection(object.id, position.x - x, position.y - y));
  },
  onDragEnd(object, tabDispatch) {
    tabDispatch(commitConnectionMove(object.id));
  },
});

