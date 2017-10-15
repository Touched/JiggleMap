import createMouseTool, { MOUSE_PRESS, MOUSE, MOUSE_RELEASE, initialState } from '../createMouseTool';

describe('createMouseTool', () => {
  let mouseTool;
  let getCursorForObject;
  const reducer = jest.fn((state = { foo: 'bar' }) => state);

  beforeEach(() => {
    getCursorForObject = jest.fn(() => 'pointer');
    mouseTool = createMouseTool({
      onMousePress: jest.fn(),
      onMouse: jest.fn(),
      onMouseRelease: jest.fn(),
      getCursorForObject,
      handlesType(type) {
        return type === 'main-map';
      },
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

  it('returns a cursor only over the handle type', () => {
    expect(mouseTool.getCursorForObject({ type: 'main-map' }, {})).toEqual('pointer');
    expect(mouseTool.getCursorForObject({ type: 'other' }, {})).toEqual('auto');
  });

  it('calls getCursorForObject', () => {
    mouseTool.getCursorForObject({ type: 'main-map' }, { mouse: 'foo', tool: 'bar' });
    expect(getCursorForObject).toHaveBeenCalledWith({ type: 'main-map' }, 'foo', 'bar');
  });

  describe('reducer', () => {
    it('sets the intial state', () => {
      expect(mouseTool.reducer(undefined, {})).toMatchSnapshot();
      expect(createMouseTool({}).reducer(undefined, {})).toMatchSnapshot();
    });

    describe('MOUSE_PRESS', () => {
      it('stores the information', () => {
        const position = {
          x: 10,
          y: 5,
        };

        const clientOffset = { x: 156, y: 167 };

        const state = mouseTool.reducer({}, {
          type: MOUSE_PRESS,
          object,
          position,
          clientOffset,
        });

        expect(state).toMatchObject({
          mouse: {
            clientOffset,
            startingPosition: position,
            currentPosition: position,
            object,
          },
        });
      });
    });

    describe('MOUSE', () => {
      it('updates the currentPosition', () => {
        const position = { x: 10, y: 5 };
        const state = mouseTool.reducer({}, {
          type: MOUSE,
          position,
        });

        expect(state).toMatchObject({
          mouse: {
            currentPosition: position,
          },
        });
      });
    });

    describe('MOUSE_RELEASE', () => {
      it('sets the startingPosition to null', () => {
        const state = mouseTool.reducer({}, {
          type: MOUSE_RELEASE,
        });

        expect(state).toMatchObject({
          mouse: {
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

        const state = mouseTool.reducer(undefined, action);

        expect(reducer).toHaveBeenCalledWith(undefined, action);
        expect(state).toEqual({
          mouse: initialState,
          tool: {
            foo: 'bar',
          },
        });
      });
    });
  });

  describe('mouse press', () => {
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
      mouse: {
        foo: 'bar',
      },
      tool: {
        baz: 'quz',
      },
    };

    const updatedState = {
      ...state,
      mouse: {
        ...state.mouse,
        startingPosition: position,
      },
    };

    it('it does not call onMousePress when onMouseDown is called with a non main-map object', () => {
      mouseTool.onMouseDown({});
      expect(mouseTool.onMousePress).not.toHaveBeenCalled();
    });

    it('calls onMousePress when onMouseDown is called with a main-map object', () => {
      mouseTool.onMouseDown(object, state, meta, dispatch, event);
      expect(mouseTool.onMousePress).toHaveBeenCalledWith(position, updatedState.mouse, updatedState.tool, dispatch, event);
    });

    it('dispatches a MOUSE_PRESS action', () => {
      mouseTool.onMouseDown(object, updatedState, meta, dispatch, event);
      expect(dispatch).toHaveBeenLastCalledWith({
        type: MOUSE_PRESS,
        clientOffset: {
          x: 68,
          y: 13,
        },
        position,
        object,
      });
    });
  });

  describe('mouse', () => {
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
      mouse: {
        clientOffset: {
          x: 115,
          y: 76,
        },
        startingPosition: position,
        currentPosition: position,
      },
      tool: {
        foo: 'bar',
      },
    };

    it('does not call onMouse if there was no onMousePress', () => {
      mouseTool.onMouseMove({ mouse: {} }, meta, dispatch, event);
      expect(mouseTool.onMouse).not.toHaveBeenCalled();
    });

    it('calls onMouse if there was a onMousePress', () => {
      mouseTool.onMouseMove(state, meta, dispatch, event);
      expect(mouseTool.onMouse).toHaveBeenCalledWith({
        x: 7,
        y: 1,
      }, state.mouse, state.tool, dispatch, event);
    });

    it('does not call onMouse if the cursor has not moved to a different grid cell', () => {
      const newState = {
        ...state,
        mouse: {
          ...state.mouse,
          startingPosition: position,
          currentPosition: { x: 7, y: 1 },
        },
      };

      mouseTool.onMouseMove(newState, meta, dispatch, event);
      expect(mouseTool.onMouse).not.toHaveBeenCalled();
    });

    it('dispatches a MOUSE action', () => {
      mouseTool.onMouseMove(state, meta, dispatch, event);
      expect(dispatch).toHaveBeenLastCalledWith({
        type: MOUSE,
        position: { x: 7, y: 1 },
      });
    });
  });

  describe('mouse release', () => {
    const position = {};
    const event = {};

    const state = {
      mouse: {
        startingPosition: position,
      },
    };

    it('does not call onMouseRelease if there was no onMousePress', () => {
      mouseTool.onMouseUp({ mouse: {} }, meta, dispatch);
      expect(mouseTool.onMouseRelease).not.toHaveBeenCalled();
    });

    it('calls onMouseRelease if there was a onMousePress', () => {
      mouseTool.onMouseUp(state, meta, dispatch, event);
      expect(mouseTool.onMouseRelease).toHaveBeenCalledWith(state.mouse, undefined, dispatch, event);
    });

    it('dispatches a MOUSE_RELEASE action', () => {
      mouseTool.onMouseUp(state, meta, dispatch);
      expect(dispatch).toHaveBeenLastCalledWith({
        type: MOUSE_RELEASE,
      });
    });
  });
});
