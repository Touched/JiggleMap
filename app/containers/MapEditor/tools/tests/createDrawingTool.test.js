import createDrawingTool from '../createDrawingTool';
import { COMMIT_MAP_EDIT, EDIT_MAP } from '../../constants';

describe('createDrawingTool', () => {
  const tool = createDrawingTool({
    cursor: 'pointer',
    buildPatch: jest.fn((object, s, e) => [{
      ...s,
      block: 1,
    }, {
      ...e,
      block: 2,
    }]),
  });

  it('sets the cursor for the main map', () => {
    expect(tool.getCursorForObject({ type: 'main-map' }, {})).toEqual('pointer');
    expect(tool.getCursorForObject({ type: 'other' }, {})).toEqual('auto');
  });

  it('calls onMouse on draw start (starts drawing immediately when the mouse button is pressed)', () => {
    const dispatch = jest.fn();
    const object = {};
    const event = {};
    const state = {
      mouse: {
        startingPosition: { x: 5, y: 4 },
        object,
      },
      tool: {},
    };
    const position = {};

    jest.spyOn(tool, 'onMouse');

    tool.onMousePress(position, state.mouse, state.tool, dispatch, event);

    expect(tool.onMouse).toHaveBeenCalledWith(position, state.mouse, state.tool, dispatch, event);
  });

  it('calls EDIT_MAP with the result of calling buildPatch on draw', () => {
    const start = { x: 5, y: 4 };
    const end = { x: 7, y: 9 };
    const dispatch = jest.fn();
    const object = {};
    const event = {};
    const state = {
      mouse: {
        startingPosition: start,
        object,
      },
      tool: {},
    };

    tool.onMouse(end, state.mouse, state.tool, dispatch, event);

    expect(tool.buildPatch).toHaveBeenLastCalledWith(object, start, end, event);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: EDIT_MAP,
      patch: [{
        ...start,
        block: 1,
      }, {
        ...end,
        block: 2,
      }],
    }));
  });

  it('dispatches a COMMIT_MAP_EDIT when the draw is completed', () => {
    const dispatch = jest.fn();
    tool.onMouseRelease({}, {}, dispatch);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: COMMIT_MAP_EDIT,
    }));
  });
});
