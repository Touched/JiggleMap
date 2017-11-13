/* @flow */

import React from 'react';
import invariant from 'invariant';

import messages from './messages';
import { drawLine } from './helpers';
import { editMap, commitMapEdit } from '../actions';
import BlockPicker from './BlockPicker';
import type { Dispatch, Meta, Object, ReactMouseEvent } from './types';

type Position = {
  x: number;
  y: number;
};

type State = {
  startingPosition: ?Position;
  currentPosition: ?Position;
  clientOffset: ?Position;
  currentBlock: number;
};

type DrawStartAction = {
  type: typeof DRAW_START;
  clientOffset: Position;
  position: Position;
  object: Object;
};

type DrawAction = {
  type: typeof DRAW;
  position: Position;
};

type DrawEndAction = {
  type: typeof DRAW_END;
};

type SetBlockAction = {
  type: typeof SET_BLOCK;
  block: number;
};

type Action = DrawStartAction | DrawAction | DrawEndAction | SetBlockAction;

const initialState = {
  startingPosition: null,
  currentPosition: null,
  clientOffset: null,
  currentBlock: 0,
};

export const DRAW_START = 'jigglemap/MapEditor/DrawingTool/DRAW_START';
export const DRAW = 'jigglemap/MapEditor/DrawingTool/DRAW';
export const DRAW_END = 'jigglemap/MapEditor/DrawingTool/DRAW_END';
export const SET_BLOCK = 'jigglemap/MapEditor/DrawingTool/SET_BLOCK';

function toGridCoordinates(x, y) {
  return {
    x: Math.floor(x / 16),
    y: Math.floor(y / 16),
  };
}

function setBlock(block) {
  return {
    type: SET_BLOCK,
    block,
  };
}

export default {
  id: 'line-tool',
  type: 'mouse',
  name: messages.lineToolName,
  description: messages.lineToolDescription,
  layers: ['map'],
  icon: 'dot',
  component: ({ tabDispatch }: { tabDispatch: Dispatch }) => (
    <BlockPicker onChange={(block) => tabDispatch(setBlock(block))} />
  ),
  getCursorForObject(object: Object) {
    return object.type === 'main-map' ? 'crosshair' : 'auto';
  },
  onDraw({ x: endX, y: endY }: Position, state: State, tabDispatch: Dispatch) {
    if (state.startingPosition) {
      const patch = drawLine(state.startingPosition.x, state.startingPosition.y, endX, endY, (x, y) => ({
        x,
        y,
        block: state.currentBlock,
      }));

      tabDispatch(editMap(patch));
    }
  },
  onDrawEnd(state: Dispatch, tabDispatch: Dispatch) {
    tabDispatch(commitMapEdit());
  },
  onMouseDown(object: Object, state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
    if (object.type === 'main-map' && mouseEvent.button === 0) {
      const { nativeEvent: { offsetX, offsetY }, clientX, clientY } = mouseEvent;
      const position = toGridCoordinates(offsetX, offsetY);

      tabDispatch({
        type: DRAW_START,
        clientOffset: {
          x: (clientX / meta.zoomLevel) - offsetX,
          y: (clientY / meta.zoomLevel) - offsetY,
        },
        position,
        object,
      });

      this.onDraw(position, {
        ...state,
        startingPosition: position,
      }, tabDispatch);
    }
  },
  onMouseMove(state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
    if (state.startingPosition) {
      invariant(state.clientOffset, 'mousedown event did not set the clientOffset');
      invariant(state.currentPosition, 'mousedown event did not set the currentPosition');

      const x = (mouseEvent.clientX / meta.zoomLevel) - state.clientOffset.x;
      const y = (mouseEvent.clientY / meta.zoomLevel) - state.clientOffset.y;

      // FIXME: Check for changes based on grid coordinates, not mouse coordinates
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
  onMouseUp(state: State, meta: Meta, tabDispatch: Dispatch) {
    if (state.startingPosition) {
      tabDispatch({
        type: DRAW_END,
      });

      this.onDrawEnd(state, tabDispatch);
    }
  },
  reducer(state: State = initialState, action: Action) {
    switch (action.type) {
      case DRAW_START:
        return {
          ...state,
          clientOffset: action.clientOffset,
          startingPosition: action.position,
          currentPosition: action.position,
          object: action.object,
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
      case SET_BLOCK:
        return {
          ...state,
          currentBlock: action.block,
        };
      default:
        return state;
    }
  },
};
