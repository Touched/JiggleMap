/* @flow */

import * as React from 'react';
import invariant from 'invariant';
import createMouseTool from './createMouseTool';
import { commitMapEdit, editMap } from '../actions';
import type { Dispatch, Layer, Message, Object, ReactMouseEvent, MouseTool } from './types';
import type { Position, MouseToolState } from './createMouseTool';

type Patch = {
  x: number;
  y: number;
  block?: number;
  collision?: number;
  height?: number;
};

type State = {
};

type DrawingTool = {
  id: string;
  name: Message;
  description: Message;
  layers: Array<Layer>;
  icon: React.Element<*>;
  component: React.ComponentType<any>;
  cursor: string;
  buildPatch: (object: Object, start: Position, end: Position) => Array<Patch>;
  reducer?: (state: CombinedState<State>, action: Action) => CombinedState<State>;
};

export default function createDrawingTool(definition: DrawingTool): MouseTool<State> {
  return createMouseTool({
    ...definition,
    handlesType(type) {
      return type === 'main-map';
    },
    getCursorForObject() {
      return this.cursor;
    },
    onMousePress(position: Position, mouseState: MouseToolState, state: State, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      this.onMouse(position, mouseState, state, tabDispatch, mouseEvent);
    },
    onMouse(position: Position, mouseState: MouseToolState, state: State, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      invariant(mouseState.object, 'onMousePress did not set the object');

      const patch = this.buildPatch(
        mouseState.object,
        mouseState.startingPosition,
        position,
        mouseEvent,
      );

      tabDispatch(editMap(patch));
    },
    onMouseRelease(mouseState: MouseToolState, state: State, tabDispatch: Dispatch) {
      tabDispatch(commitMapEdit());
    },
    reducer: definition.reducer,
  });
}
