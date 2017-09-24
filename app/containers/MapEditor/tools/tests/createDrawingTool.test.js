import createDrawingTool, { DRAW_START, DRAW, DRAW_END, initialState } from '../createDrawingTool';

describe('createDrawingTool', () => {
  let drawingTool;
  const reducer = jest.fn((state = { foo: 'bar' }) => state);

  beforeEach(() => {
    drawingTool = createDrawingTool({
      onDrawStart: jest.fn(),
      onDraw: jest.fn(),
      onDrawEnd: jest.fn(),
      getCursorForObject: () => 'pointer',
      reducer,
    });
  });

  const object = {
    type: 'main-map',
  };

  const meta = {
    zoomLevel: 2,
  };

  const dispatch = jest.fn();

  it('returns a cursor only over the main map', () => {
    expect(drawingTool.getCursorForObject({ type: 'main-map' })).toEqual('pointer');
    expect(drawingTool.getCursorForObject({ type: 'other' })).toEqual('auto');
  });

  describe('reducer', () => {
    it('sets the intial state', () => {
      expect(drawingTool.reducer(undefined, {})).toMatchSnapshot();
      expect(createDrawingTool({}).reducer(undefined, {})).toMatchSnapshot();
    });

    describe('DRAW_START', () => {
      it('stores the information', () => {
        const position = {
          x: 10,
          y: 5,
        };

        const clientOffset = { x: 156, y: 167 };

        const state = drawingTool.reducer({}, {
          type: DRAW_START,
          object,
          position,
          clientOffset,
        });

        expect(state).toMatchObject({
          drawing: {
            clientOffset,
            startingPosition: position,
            currentPosition: position,
            object,
          },
        });
      });
    });

    describe('DRAW', () => {
      it('updates the currentPosition', () => {
        const position = { x: 10, y: 5 };
        const state = drawingTool.reducer({}, {
          type: DRAW,
          position,
        });

        expect(state).toMatchObject({
          drawing: {
            currentPosition: position,
          },
        });
      });
    });

    describe('DRAW_END', () => {
      it('sets the startingPosition to null', () => {
        const state = drawingTool.reducer({}, {
          type: DRAW_END,
        });

        expect(state).toMatchObject({
          drawing: {
            startingPosition: null,
          },
        });
      });
    });

    describe('default', () => {
      it('passes the action through to the child reducer', () => {
        const action = {
          type: 'foo',
        };

        const state = drawingTool.reducer(undefined, action);

        expect(reducer).toHaveBeenCalledWith(undefined, action);
        expect(state).toEqual({
          drawing: initialState,
          tool: {
            foo: 'bar',
          },
        });
      });
    });
  });

  describe('draw start', () => {
    const event = {
      nativeEvent: {
        offsetX: 160,
        offsetY: 80,
      },
      clientX: 456,
      clientY: 186,
    };

    const position = {
      x: 10,
      y: 5,
    };

    const state = {
      drawing: {
        foo: 'bar',
      },
    };

    const updatedState = {
      ...state,
      drawing: {
        ...state.drawing,
        startingPosition: position,
      },
    };

    it('it does not call onDrawStart when onMouseDown is called with a non main-map object', () => {
      drawingTool.onMouseDown({});
      expect(drawingTool.onDrawStart).not.toHaveBeenCalled();
    });

    it('calls onDrawStart when onMouseDown is called with a main-map object', () => {
      drawingTool.onMouseDown(object, state, meta, dispatch, event);
      expect(drawingTool.onDrawStart).toHaveBeenCalledWith(position, updatedState, dispatch);
    });

    it('calls onDraw when onMouseDown is called with a main-map object', () => {
      drawingTool.onMouseDown(object, state, meta, dispatch, event);
      expect(drawingTool.onDraw).toHaveBeenCalledWith(position, updatedState, dispatch);
    });

    it('dispatches a DRAW_START action', () => {
      drawingTool.onMouseDown(object, updatedState, meta, dispatch, event);
      expect(dispatch).toHaveBeenLastCalledWith({
        type: DRAW_START,
        clientOffset: {
          x: 68,
          y: 13,
        },
        position,
        object,
      });
    });
  });

  describe('draw', () => {
    const event = {
      nativeEvent: {
        offsetX: 160,
        offsetY: 80,
      },
      clientX: 456,
      clientY: 186,
    };

    const position = {
      x: 10,
      y: 5,
    };

    const state = {
      drawing: {
        clientOffset: {
          x: 115,
          y: 76,
        },
        startingPosition: position,
        currentPosition: position,
      },
    };

    it('does not call onDraw if there was no onDrawStart', () => {
      drawingTool.onMouseMove({ drawing: {} }, meta, dispatch, event);
      expect(drawingTool.onDraw).not.toHaveBeenCalled();
    });

    it('calls onDraw if there was a onDrawStart', () => {
      drawingTool.onMouseMove(state, meta, dispatch, event);
      expect(drawingTool.onDraw).toHaveBeenCalledWith({
        x: 7,
        y: 1,
      }, state, dispatch);
    });

    it('does not call onDraw if the cursor has not moved to a different grid cell', () => {
      const newState = {
        ...state,
        drawing: {
          ...state.drawing,
          startingPosition: position,
          currentPosition: { x: 7, y: 1 },
        },
      };

      drawingTool.onMouseMove(newState, meta, dispatch, event);
      expect(drawingTool.onDraw).not.toHaveBeenCalled();
    });

    it('dispatches a DRAW action', () => {
      drawingTool.onMouseMove(state, meta, dispatch, event);
      expect(dispatch).toHaveBeenLastCalledWith({
        type: DRAW,
        position: { x: 7, y: 1 },
      });
    });
  });

  describe('draw end', () => {
    const position = {};

    const state = {
      drawing: {
        startingPosition: position,
      },
    };

    it('does not call onDrawEnd if there was no onDrawStart', () => {
      drawingTool.onMouseUp({ drawing: {} }, meta, dispatch);
      expect(drawingTool.onDrawEnd).not.toHaveBeenCalled();
    });

    it('calls onDrawEnd if there was a onDrawStart', () => {
      drawingTool.onMouseUp(state, meta, dispatch);
      expect(drawingTool.onDrawEnd).toHaveBeenCalledWith(state, dispatch);
    });

    it('dispatches a DRAW_END action', () => {
      drawingTool.onMouseUp(state, meta, dispatch);
      expect(dispatch).toHaveBeenLastCalledWith({
        type: DRAW_END,
      });
    });
  });
});
