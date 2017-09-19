/* @flow */

import React from 'react';
import VectorLineIcon from 'mdi-react/VectorLineIcon';

import messages from './messages';
import buildTool from './buildTool';
import { drawLine } from './helpers';
import { editMap, commitMapEdit } from '../actions';

const initialState = {
  startingPosition: null,
  currentPosition: null,
};

export const DRAW_START = 'jigglemap/MapEditor/DrawingTool/DRAW_START';
export const DRAW = 'jigglemap/MapEditor/DrawingTool/DRAW';
export const DRAW_END = 'jigglemap/MapEditor/DrawingTool/DRAW_END';

function toGridCoordinates(x, y) {
  return {
    x: Math.floor(x / 16),
    y: Math.floor(y / 16),
  };
}

export default buildTool({
  id: 'line-tool',
  name: messages.lineToolName,
  description: messages.lineToolDescription,
  layers: ['map'],
  icon: <VectorLineIcon />,
  getCursorForObject(object) {
    return object.type === 'main-map' ? 'crosshair' : 'auto';
  },
  onDraw({ x: endX, y: endY }, state, tabDispatch) {
    const patch = drawLine(state.startingPosition.x, state.startingPosition.y, endX, endY, (x, y) => ({
      x,
      y,
      block: 1,
    }));

    tabDispatch(editMap(patch));
  },
  onDrawEnd(state, tabDispatch) {
    tabDispatch(commitMapEdit());
  },
  onMouseDown(object, state, tabDispatch, mouseEvent) {
    if (object.type === 'main-map') {
      const { nativeEvent: { offsetX, offsetY }, clientX, clientY } = mouseEvent;
      const position = toGridCoordinates(offsetX, offsetY);

      tabDispatch({
        type: DRAW_START,
        clientOffset: {
          x: clientX - offsetX,
          y: clientY - offsetY,
        },
        position,
      });

      this.onDraw(position, {
        ...state,
        startingPosition: position,
      }, tabDispatch);
    }
  },
  onMouseMove(state, tabDispatch, mouseEvent) {
    if (state.startingPosition) {
      const x = mouseEvent.clientX - state.clientOffset.x;
      const y = mouseEvent.clientY - state.clientOffset.y;

      if (state.currentPosition.x !== x || state.currentPosition.y !== y) {
        const position = toGridCoordinates(x, y);

        tabDispatch({
          type: DRAW,
          position,
        });

        this.onDraw(position, state, tabDispatch);
      }
    }
  },
  onMouseUp(state, tabDispatch) {
    if (state.startingPosition) {
      tabDispatch({
        type: DRAW_END,
      });

      this.onDrawEnd(state, tabDispatch);
    }
  },
  reducer(state = initialState, action) {
    switch (action.type) {
      case DRAW_START:
        return {
          ...state,
          clientOffset: action.clientOffset,
          startingPosition: action.position,
          currentPosition: action.position,
        };
      case DRAW:
        return {
          ...state,
          currentPosition: action.position,
        };
      case DRAW_END:
        return {
          ...state,
          startingPosition: null,
        };
      default:
        return state;
    }
  },
});
