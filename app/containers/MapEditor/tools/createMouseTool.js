import { combineReducers } from 'redux';
import invariant from 'invariant';

export const MOUSE_PRESS = 'jigglemap/MapEditor/MouseTool/MOUSE_PRESS';
export const MOUSE = 'jigglemap/MapEditor/MouseTool/MOUSE';
export const MOUSE_RELEASE = 'jigglemap/MapEditor/MouseTool/MOUSE_RELEASE';

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

export type MouseToolState = {
  startingPosition: ?Position;
  currentPosition: ?Position;
  clientOffset: ?Position;
  currentBlock: number;
  object: ?Object;
};

export type MousePressAction = {
  type: typeof MOUSE_PRESS;
  clientOffset: Position;
  position: Position;
  object: Object;
};

export type MouseAction = {
  type: typeof MOUSE;
  position: Position;
};

export type MouseReleaseAction = {
  type: typeof MOUSE_RELEASE;
};

export type Action = MousePressAction | MouseAction | MouseReleaseAction;

export type CombinedState<State> = {
  mouse: MouseToolState;
  tool: State;
};

export type MouseTool<State> = {
  id: string;
  name: Message;
  description: Message;
  layers: Array<Layer>;
  icon: React.Element<*>;
  component: React.ComponentType<any>;
  reducer?: (state: CombinedState<State>, action: Action) => CombinedState<State>;
  getCursorForObject: (object: Object, mouseState: CombinedState, state: State) => string;
  onMousePress: (object: Object, position: Position, mouseState: MouseToolState, state: State, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
  onMouse: (position: Position, mouseState: MouseToolState, state: State, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
  onMouseRelease: (mouseState: MouseToolState, state: State, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) => void;
};

function toGridCoordinates(x, y) {
  return {
    x: Math.floor(x / 16),
    y: Math.floor(y / 16),
  };
}

function reducer(state: MouseToolState = initialState, action: Action): MouseToolState {
  switch (action.type) {
    case MOUSE_PRESS:
      return {
        ...state,
        clientOffset: action.clientOffset,
        startingPosition: action.position,
        currentPosition: action.position,
        object: action.object,
      };
    case MOUSE:
      return {
        ...state,
        currentPosition: action.position,
      };
    case MOUSE_RELEASE:
      return {
        ...state,
        startingPosition: null,
      };
    default:
      (action: empty); // eslint-disable-line no-unused-expressions
      return state;
  }
}

export default function createMouseTool(definition): MouseTool<CombinedState<State>> {
  type State = CombinedState<T>;

  const combinedReducer = combineReducers({
    mouse: reducer,
    tool: definition.reducer || ((state = {}) => state),
  });

  return {
    ...definition,
    type: 'mouse',
    getCursorForObject(object, state) {
      if (this.handlesType(object.type)) {
        return definition.getCursorForObject(object, state.mouse, state.tool);
      }

      return 'auto';
    },
    onMouseDown(object: Object, state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (this.handlesType(object.type)) {
        const { nativeEvent: { offsetX, offsetY }, clientX, clientY } = mouseEvent;
        const position = toGridCoordinates(offsetX, offsetY);

        tabDispatch({
          type: MOUSE_PRESS,
          clientOffset: {
            x: (clientX / meta.zoomLevel) - offsetX,
            y: (clientY / meta.zoomLevel) - offsetY,
          },
          position,
          object,
        });

        const mouseState = {
          ...state.mouse,
          startingPosition: position,
        };

        this.onMousePress(position, mouseState, state.tool, tabDispatch, mouseEvent);
      }
    },
    onMouseMove(state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (state.mouse.startingPosition) {
        const { clientOffset, currentPosition } = state.mouse;

        invariant(clientOffset, 'mousedown event did not set the clientOffset');
        invariant(currentPosition, 'mousedown event did not set the currentPosition');

        const x = (mouseEvent.clientX / meta.zoomLevel) - clientOffset.x;
        const y = (mouseEvent.clientY / meta.zoomLevel) - clientOffset.y;
        const position = toGridCoordinates(x, y);

        if (currentPosition.x !== position.x || currentPosition.y !== position.y) {
          tabDispatch({
            type: MOUSE,
            position,
          });

          this.onMouse(position, state.mouse, state.tool, tabDispatch, mouseEvent);
        }
      }
    },
    onMouseUp(state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (state.mouse.startingPosition) {
        tabDispatch({
          type: MOUSE_RELEASE,
        });

        this.onMouseRelease(state.mouse, state.tool, tabDispatch, mouseEvent);
      }
    },
    reducer: combinedReducer,
  };
}
