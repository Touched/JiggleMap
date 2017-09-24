/* @flow */

import * as React from 'react';

export type Action = {
  type: string;
};

export type Dispatch = (action: Action) => void;

export type Message = string | {
  id: string;
  defaultMessage?: string;
};

export type Layer = 'map' | 'collision' | 'height' | 'entities';

export type ObjectType = 'main-map' | 'connected-map' | 'entity';

export type Object = {
  type: ObjectType;
};

export type Meta = {
  zoomLevel: number;
};

export type ReactMouseEvent = { nativeEvent: MouseEvent } & SyntheticMouseEvent<*>;

export type Tool<State> = {
  id: string;
  name: Message;
  description: Message;
  layers: Array<Layer>;
  icon: React.Element<*>;
  component: React.ComponentType<any>;
  reducer: (state: State, action: Action) => State;
  getCursorForObject: (object: Object) => string;
  onMouseDown: (object: Object, state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
  onMouseMove: (state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
  onMouseUp: (state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
};
