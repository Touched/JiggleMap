import createBasicDrawingTool from '../createBasicDrawingTool';
import { COMMIT_MAP_EDIT, EDIT_MAP } from '../../constants';

describe('createBasicDrawingTool', () => {
  const tool = createBasicDrawingTool({
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
    expect(tool.getCursorForObject({ type: 'main-map' })).toEqual('pointer');
    expect(tool.getCursorForObject({ type: 'other' })).toEqual('auto');
  });

  it('calls onDraw on draw start (starts drawing immediately when the mouse button is pressed)', () => {
    const dispatch = jest.fn();
    const object = {};
    const state = {
      drawing: {
        startingPosition: { x: 5, y: 4 },
        object,
      },
      tool: {
        previousPatch: [],
      },
    };
    const position = {};

    jest.spyOn(tool, 'onDraw');

    tool.onDrawStart(object, position, state, dispatch);

    expect(tool.onDraw).toHaveBeenCalledWith(position, state, dispatch);
  });

  it('calls EDIT_MAP with the result of calling buildPatch on draw', () => {
    const start = { x: 5, y: 4 };
    const end = { x: 7, y: 9 };
    const dispatch = jest.fn();
    const object = {};
    const previousPatch = [{ x: 5, y: 10, block: 7 }];
    const state = {
      drawing: {
        startingPosition: start,
        object,
      },
      tool: {
        previousPatch,
      },
    };

    tool.onDraw(end, state, dispatch);

    expect(tool.buildPatch).toHaveBeenLastCalledWith(object, start, end, previousPatch);
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
    tool.onDrawEnd({}, dispatch);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: COMMIT_MAP_EDIT,
    }));
  });
});
