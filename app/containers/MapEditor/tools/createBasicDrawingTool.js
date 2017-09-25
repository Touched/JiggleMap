/* @flow */

import * as React from 'react';
import invariant from 'invariant';
import createDrawingTool from './createDrawingTool';
import { commitMapEdit, editMap } from '../actions';
import type { Dispatch, Layer, Message, Object, Tool } from './types';
import type { Position, CombinedState } from './createDrawingTool';

type Patch = {
  x: number;
  y: number;
  block?: number;
  collision?: number;
  height?: number;
};

type State = {
  previousPatch: Array<Patch>;
};

type BasicDrawingTool = {
  id: string;
  name: Message;
  description: Message;
  layers: Array<Layer>;
  icon: React.Element<*>;
  component: React.ComponentType<any>;
  cursor: string;
  buildPatch: (object: Object, start: Position, end: Position, previousPatch: Array<Patch>) => Array<Patch>;
};

export default function createBasicDrawingTool(definition: BasicDrawingTool): Tool<CombinedState<State>> {
  return createDrawingTool({
    ...definition,
    getCursorForObject() {
      return this.cursor;
    },
    onDrawStart(object: Object, position: Position, state: CombinedState<State>, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      this.onDraw(position, state, tabDispatch, mouseEvent);
    },
    onDraw(position: Position, state: CombinedState<State>, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      invariant(state.drawing.object, 'onDrawStart did not set the object');

      const patch = this.buildPatch(
        state.drawing.object,
        state.drawing.startingPosition,
        position,
        state.tool.previousPatch,
        mouseEvent,
      );

      tabDispatch(editMap(patch));
    },
    onDrawEnd(state: CombinedState<State>, tabDispatch: Dispatch) {
      tabDispatch(commitMapEdit());
    },
  });
}
