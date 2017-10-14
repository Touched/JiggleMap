import {
  loadMainMap,
  loadConnectedMap,
  editMap,
  commitMapEdit,
  setCameraPosition,
  moveConnection,
  commitConnectionMove,
  moveEntity,
  commitEntityMove,
  setActiveLayer,
} from '../actions';
import { mapDataReducer, mapEditingReducer } from '../reducer';

describe('mapDataReducer', () => {
  it('returns the initial state', () => {
    expect(mapDataReducer(undefined, {})).toMatchSnapshot();
  });

  const mapData = {
    width: 2,
    height: 2,
    data: {
      height: [1, 1, 2, 3],
      collision: [1, 1, 0, 1],
      block: [1, 2, 3, 4],
    },
  };

  const blocksetData = {
    primary: {
      resource: {
        meta: {
          id: 'blockset1',
        },
        data: {
          palette: [[[0, 0, 0, 0]]],
          blocks: [{
            tiles: [{ tile: 0, flipX: false, flipY: false, palette: 0 }],
          }],
        },
      },
      tiles: [1, 2, 3],
    },
    secondary: {
      resource: {
        meta: {
          id: 'blockset2',
        },
        data: {
          palette: [[[1, 2, 3, 4]]],
          blocks: [{
            tiles: [{ tile: 0, flipX: false, flipY: false, palette: 0 }],
          }],
        },
      },
      tiles: [4, 5, 6],
    },
  };

  const loadedMapData = {
    height: [1, 1, 2, 3],
    collision: [1, 1, 0, 1],
    block: [1, 2, 3, 4],
    dimensions: [2, 2],
  };

  const loadedBlocksetData = {
    primary: {
      id: 'blockset1',
      palette: [[[0, 0, 0, 0]]],
      blocks: [{
        tiles: [{ tile: 0, flipX: false, flipY: false, palette: 0 }],
      }],
      tiles: [1, 2, 3],
    },
    secondary: {
      id: 'blockset2',
      palette: [[[1, 2, 3, 4]]],
      blocks: [{
        tiles: [{ tile: 0, flipX: false, flipY: false, palette: 0 }],
      }],
      tiles: [4, 5, 6],
    },
  };

  describe('LOAD_MAIN_MAP', () => {
    it('loads map data and entities into the main map', () => {
      const action = loadMainMap({
        map: {
          data: {
            map: mapData,
            entities: [{
              type: 'unknown',
              x: 0,
              y: 1,
              z: 3,
            }],
          },
        },
      });

      const newState = mapDataReducer(undefined, action);
      expect(newState).toMatchObject({
        map: loadedMapData,
        canonicalMap: loadedMapData,
        entities: [{
          type: 'unknown',
          x: 0,
          y: 1,
          z: 3,
        }],
        canonicalEntityCoordinates: [{
          x: 0,
          y: 1,
        }],
      });
    });

    it('loads the blockset data', () => {
      const action = loadMainMap({
        blocksets: blocksetData,
      });

      const newState = mapDataReducer(undefined, action);
      expect(newState).toMatchObject({
        blocksets: loadedBlocksetData,
      });
    });
  });

  describe('LOAD_CONNECTED_MAP', () => {
    it('adds a connection to the list of connections', () => {
      const action = loadConnectedMap({
        map: {
          data: {
            map: mapData,
          },
        },
        blocksets: blocksetData,
        offset: 3,
        direction: 'up',
      });

      const newState = mapDataReducer(undefined, action);
      expect(newState.connections).toEqual([{
        map: loadedMapData,
        blocksets: loadedBlocksetData,
        offset: 3,
        direction: 'up',
      }]);

      expect(newState.canonicalConnectionOffsets).toEqual([
        3,
      ]);
    });
  });

  describe('EDIT_MAP', () => {
    it('applies a patch', () => {
      const action = editMap([{
        x: 0,
        y: 1,
        block: 1,
      }, {
        x: 1,
        y: 1,
        block: 1,
      }, {
        x: 2,
        y: 1,
        block: 1,
      }]);

      const newState = mapDataReducer({
        canonicalMap: {
          dimensions: [4, 4],
          block: [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
          ],
        },
      }, action);

      expect(newState.map.block).toEqual([
        0, 0, 0, 0,
        1, 1, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ]);
    });
  });

  describe('COMMIT_MAP_EDIT', () => {
    it('updates canonical map', () => {
      const action = commitMapEdit();
      const newState = mapDataReducer({ map: loadedMapData }, action);
      expect(newState.canonicalMap).toEqual(loadedMapData);
    });
  });

  describe('MOVE_CONNECTION', () => {
    it('moves the offset horizontally for a "down" connection', () => {
      const action = moveConnection(0, 10, 3);

      const newState = mapDataReducer({
        map: { dimensions: [30, 30] },
        connections: [{ direction: 'down' }],
        canonicalConnectionOffsets: [7],
      }, action);

      expect(newState.connections[0].offset).toEqual(17);
    });

    it('moves the offset horizontally for a "up" connection', () => {
      const action = moveConnection(0, -10, 3);

      const newState = mapDataReducer({
        map: { dimensions: [30, 30] },
        connections: [{ direction: 'up' }],
        canonicalConnectionOffsets: [7],
      }, action);

      expect(newState.connections[0].offset).toEqual(-3);
    });

    it('moves the offset vertically for a "left" connection', () => {
      const action = moveConnection(0, 10, 3);

      const newState = mapDataReducer({
        map: { dimensions: [30, 30] },
        connections: [{ direction: 'left' }],
        canonicalConnectionOffsets: [7],
      }, action);

      expect(newState.connections[0].offset).toEqual(10);
    });

    it('moves the offset vertically for a "right" connection', () => {
      const action = moveConnection(0, 10, -3);

      const newState = mapDataReducer({
        map: { dimensions: [30, 30] },
        connections: [{ direction: 'right' }],
        canonicalConnectionOffsets: [7],
      }, action);

      expect(newState.connections[0].offset).toEqual(4);
    });

    it('ignores non-directional connections', () => {
      const action = moveConnection(0, 10, -3);

      const newState = mapDataReducer({
        map: { dimensions: [30, 30] },
        connections: [{ direction: 'dive' }],
        canonicalConnectionOffsets: [0],
      }, action);

      expect(newState.connections[0].offset).toEqual(0);
    });

    it('cannot move a connection out of bounds', () => {
      const action = moveConnection(0, 100, 3);

      const newState = mapDataReducer({
        map: { dimensions: [30, 30] },
        connections: [{ direction: 'down' }],
        canonicalConnectionOffsets: [7],
      }, action);

      expect(newState.connections[0].offset).toEqual(30);
    });
  });

  describe('COMMIT_CONNECTION_MOVE', () => {
    it('updates the canonical offset', () => {
      const action = commitConnectionMove(0);

      const newState = mapDataReducer({
        connections: [{ offset: 7 }],
        canonicalConnectionOffsets: [9],
      }, action);

      expect(newState.canonicalConnectionOffsets[0]).toEqual(7);
    });
  });

  describe('MOVE_ENTITY', () => {
    const state = {
      map: { dimensions: [30, 30] },
      entities: [{
        id: 'entity0',
        x: 0,
        y: 0,
      }],
      canonicalEntityCoordinates: [{
        x: 8,
        y: 9,
      }],
    };

    it('moves the entity', () => {
      const action = moveEntity('entity0', 5, 7);

      const newState = mapDataReducer(state, action);

      expect(newState.entities[0]).toEqual({
        id: 'entity0',
        x: 13,
        y: 16,
      });
    });

    it('ignores unknown entities', () => {
      const action = moveEntity('entity1', 5, 7);

      const newState = mapDataReducer(state, action);

      expect(newState.entities[0]).toEqual({
        id: 'entity0',
        x: 0,
        y: 0,
      });
    });


    it('cannot move an entity out of bounds', () => {
      const action = moveEntity('entity0', 50, 70);

      const newState = mapDataReducer(state, action);

      expect(newState.entities[0]).toEqual({
        id: 'entity0',
        x: 29,
        y: 29,
      });
    });
  });

  describe('COMMIT_ENTITY_MOVE', () => {
    const state = {
      map: { dimensions: [30, 30] },
      entities: [{
        id: 'entity0',
        x: 0,
        y: 0,
      }],
      canonicalEntityCoordinates: [{
        x: 8,
        y: 9,
      }],
    };

    it('updates the canonical coordinates', () => {
      const action = commitEntityMove('entity0');
      const newState = mapDataReducer(state, action);

      expect(newState.canonicalEntityCoordinates[0]).toEqual({
        x: 0,
        y: 0,
      });
    });

    it('ignores unknown entity ids', () => {
      const action = commitEntityMove('entity1');
      const newState = mapDataReducer(state, action);

      expect(newState.canonicalEntityCoordinates[0]).toEqual({
        x: 8,
        y: 9,
      });
    });
  });
});

describe('mapEditingReducer', () => {
  it('returns the initial state', () => {
    expect(mapEditingReducer(undefined, {})).toMatchSnapshot();
  });

  describe('LOAD_MAIN_MAP', () => {
    it('recenters the map', () => {
      const state = {
        viewportSize: {
          width: 500,
          height: 600,
        },
      };

      const action = loadMainMap({
        map: {
          data: {
            map: {
              width: 24,
              height: 20,
            },
          },
        },
      });

      const newState = mapEditingReducer(state, action);

      expect(newState.camera).toMatchSnapshot();
    });
  });

  describe('SET_CAMERA_POSITION', () => {
    it('changes the camera position', () => {
      const action = setCameraPosition(1, 2, 3);

      const newState = mapEditingReducer(undefined, action);
      expect(newState.camera).toEqual({
        x: 1,
        y: 2,
        z: 3,
      });
    });
  });

  describe('SET_ACTIVE_LAYER', () => {
    it('sets the active layer', () => {
      const action = setActiveLayer('collision');
      const newState = mapEditingReducer(undefined, action);
      expect(newState.activeLayer).toEqual('collision');
    });
  });
});
