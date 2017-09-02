/* @flow */

import React from 'react';

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

export type Tool<State> = {
  id: string;
  name: Message;
  description: Message;
  layers: Array<Layer>;
  icon: React.Element<*>;
  component: React.Component<*, *, *>;
  reducer: (state: State, action: Action) => State;
  getCursorForObjectType: (object: Object) => string;
  onMouseDown: (object: Object, state: State, tabDispatch: Dispatch, mouseEvent: Event) => void;
  onMouseMove: (state: State, tabDispatch: Dispatch, mouseEvent: Event) => void;
  onMouseUp: (state: State, tabDispatch: Dispatch, mouseEvent: Event) => void;
};
