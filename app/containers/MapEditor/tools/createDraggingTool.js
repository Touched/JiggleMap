import createMouseTool from './createMouseTool';

export default function createDraggingTool(definition): MouseTool<State> {
  return createMouseTool({
    ...definition,
    getCursorForObject(object, mouseState) {
      return mouseState.startingPosition ? '-webkit-grabbing' : '-webkit-grab';
    },
    onMousePress() {},
    onMouse(position: Position, mouseState: MouseToolState, state: State, tabDispatch: Dispatch) {
      this.onDrag(mouseState.object, mouseState.startingPosition, position, state, tabDispatch);
    },
    onMouseRelease(mouseState: MouseToolState, state: State, tabDispatch: Dispatch) {
      this.onDragEnd(mouseState.object, tabDispatch);
    },
    reducer: definition.reducer,
  });
}
