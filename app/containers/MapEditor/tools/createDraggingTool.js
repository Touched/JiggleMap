import { combineReducers } from 'redux';
import invariant from 'invariant';

export const DRAG_START = 'jigglemap/MapEditor/DraggingTool/DRAG_START';
export const DRAG = 'jigglemap/MapEditor/DraggingTool/DRAG';
export const DRAG_END = 'jigglemap/MapEditor/DraggingTool/DRAG_END';

export const initialState = {
  startingPosition: null,
  currentPosition: null,
  clientOffset: null,
  currentBlock: 0,
  object: null,
};

function toGridCoordinates(x, y) {
  return {
    x: Math.floor(x / 16),
    y: Math.floor(y / 16),
  };
}

function reducer(state: DraggingToolState = initialState, action: Action): DraggingToolState {
  switch (action.type) {
    case DRAG_START:
      return {
        ...state,
        clientOffset: action.clientOffset,
        startingPosition: action.position,
        currentPosition: action.position,
        object: action.object,
      };
    case DRAG:
      return {
        ...state,
        currentPosition: action.position,
      };
    case DRAG_END:
      return {
        ...state,
        startingPosition: null,
      };
    default:
      (action: empty); // eslint-disable-line no-unused-expressions
      return state;
  }
}

export default function createDraggingTool(definition): MouseTool<CombinedState<State>> {
  type State = CombinedState<T>;

  const combinedReducer = combineReducers({
    dragging: reducer,
    tool: definition.reducer || ((state = {}) => state),
  });

  return {
    ...definition,
    type: 'mouse',
    getCursorForObject(object, state) {
      if (this.handlesType(object.type)) {
        return state.dragging.startingPosition ? '-webkit-grabbing' : '-webkit-grab';
      }

      return 'auto';
    },
    onMouseDown(object: Object, state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (this.handlesType(object.type)) {
        const { nativeEvent: { offsetX, offsetY }, clientX, clientY } = mouseEvent;
        const position = toGridCoordinates(offsetX, offsetY);

        tabDispatch({
          type: DRAG_START,
          clientOffset: {
            x: (clientX / meta.zoomLevel) - offsetX,
            y: (clientY / meta.zoomLevel) - offsetY,
          },
          position,
          object,
        });
      }
    },
    onMouseMove(state: State, meta: Meta, tabDispatch: Dispatch, mouseEvent: ReactMouseEvent) {
      if (state.dragging.startingPosition) {
        const { clientOffset, currentPosition } = state.dragging;

        invariant(clientOffset, 'mousedown event did not set the clientOffset');
        invariant(currentPosition, 'mousedown event did not set the currentPosition');

        const x = (mouseEvent.clientX / meta.zoomLevel) - clientOffset.x;
        const y = (mouseEvent.clientY / meta.zoomLevel) - clientOffset.y;
        const position = toGridCoordinates(x, y);

        if (currentPosition.x !== position.x || currentPosition.y !== position.y) {
          tabDispatch({
            type: DRAG,
            position,
          });

          this.onDrag(state.dragging.object, position, state, tabDispatch);
        }
      }
    },
    onMouseUp(state: State, meta: Meta, tabDispatch: Dispatch) {
      if (state.dragging.startingPosition) {
        tabDispatch({
          type: DRAG_END,
        });

        this.onDragEnd(state.dragging.object, tabDispatch);
      }
    },
    reducer: combinedReducer,
  };
}
