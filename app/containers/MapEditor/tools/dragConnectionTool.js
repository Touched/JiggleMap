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
  onDrag(object, { x: startX, y: startY }, { x: endX, y: endY }, state, tabDispatch) {
    tabDispatch(moveConnection(object.data.id, endX - startX, endY - startY));
  },
  onDragEnd(object, tabDispatch) {
    tabDispatch(commitConnectionMove(object.data.id));
  },
});

