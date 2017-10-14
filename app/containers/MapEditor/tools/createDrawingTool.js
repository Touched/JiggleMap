/* @flow */

import * as React from 'react';
import { combineReducers } from 'redux';
import invariant from 'invariant';

import type { Dispatch, Layer, Message, Meta, Object, ReactMouseEvent, MouseTool } from './types';

export const DRAW_START = 'jigglemap/MapEditor/DrawingTool/DRAW_START';
export const DRAW = 'jigglemap/MapEditor/DrawingTool/DRAW';
export const DRAW_END = 'jigglemap/MapEditor/DrawingTool/DRAW_END';

export const initialState = {
  startingPosition: null,
  currentPosition: null,
  clientOffset: null,
  currentBlock: 0,
  object: null,
};

export type Position = {
  x: number;
  y: number;
};

export type DrawingToolState = {
  startingPosition: ?Position;
  currentPosition: ?Position;
  clientOffset: ?Position;
  currentBlock: number;
  object: ?Object;
};

export type DrawStartAction = {
  type: typeof DRAW_START;
  clientOffset: Position;
  position: Position;
  object: Object;
};

export type DrawAction = {
  type: typeof DRAW;
  position: Position;
};

export type DrawEndAction = {
  type: typeof DRAW_END;
};

export type Action = DrawStartAction | DrawAction | DrawEndAction;

export type CombinedState<State> = {
  drawing: DrawingToolState;
  tool: State;
};

export type DrawingTool<State> = {
  id: string;
  name: Message;
  description: Message;
  layers: Array<Layer>;
  icon: React.Element<*>;
  component: React.ComponentType<any>;
  reducer?: (state: CombinedState<State>, action: Action) => CombinedState<State>;
  getCursorForObject: (object: Object, state: State) => string;
  onDrawStart: (object: Object, position: Position, state: CombinedState<State>, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
  onDraw: (position: Position, state: CombinedState<State>, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
  onDrawEnd: (state: CombinedState<State>, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
};

function toGridCoordinates(x, y) {
  return {
    x: Math.floor(x / 16),
    y: Math.floor(y / 16),
  };
}

function reducer(state: DrawingToolState = initialState, action: Action): DrawingToolState {
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
    default:
      (action: empty); // eslint-disable-line no-unused-expressions
      return state;
  }
}

export default function createDrawingTool<T: Object>(definition: DrawingTool<T>): MouseTool<CombinedState<T>> {
  type State = CombinedState<T>;

  const combinedReducer = combineReducers({
    drawing: reducer,
    tool: definition.reducer || ((state = {}) => state),
  });

  return {
    ...definition,
    type: 'mouse',
    getCursorForObject: (object) => object.type === 'main-map' ? definition.getCursorForObject(object) : 'auto',
    onMouseDown(object: Object, state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (object.type === 'main-map') {
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

        const updatedState = {
          ...state,
          drawing: {
            ...state.drawing,
            startingPosition: position,
          },
        };

        this.onDrawStart(position, updatedState, tabDispatch, mouseEvent);
      }
    },
    onMouseMove(state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (state.drawing.startingPosition) {
        const { clientOffset, currentPosition } = state.drawing;

        invariant(clientOffset, 'mousedown event did not set the clientOffset');
        invariant(currentPosition, 'mousedown event did not set the currentPosition');

        const x = (mouseEvent.clientX / meta.zoomLevel) - clientOffset.x;
        const y = (mouseEvent.clientY / meta.zoomLevel) - clientOffset.y;
        const position = toGridCoordinates(x, y);

        if (currentPosition.x !== position.x || currentPosition.y !== position.y) {
          tabDispatch({
            type: DRAW,
            position,
          });

          this.onDraw(position, state, tabDispatch, mouseEvent);
        }
      }
    },
    onMouseUp(state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (state.drawing.startingPosition) {
        tabDispatch({
          type: DRAW_END,
        });

        this.onDrawEnd(state, tabDispatch, mouseEvent);
      }
    },
    reducer: combinedReducer,
  };
}
