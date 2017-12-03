import { createSelector, createStructuredSelector } from 'reselect';
import { createArraySelector } from 'reselect-map';
import R from 'ramda';

const selectMapBlockset = (type) => (state) => state.blocksets[type];
const selectMapData = () => (state) => state.map;
const selectMapDimensions = () => (state) => state.map.dimensions;

/**
 * Join the primary and secondary blocksets into a single object
 */
const makeSelectMapBlocksets = () => createSelector(
  selectMapBlockset('primary'),
  selectMapBlockset('secondary'),
  (primary, secondary) => ({
    primary,
    secondary,
  }),
);

const makeSelectConnectionPosition = ([theirWidth, theirHeight]) => createSelector(
  (state) => state.offset,
  (state) => state.direction,
  selectMapDimensions(),
  (offset, direction, [myWidth, myHeight]) => {
    switch (direction) {
      case 'up':
        return {
          x: offset,
          y: -myHeight,
        };
      case 'down':
        return {
          x: offset,
          y: theirHeight,
        };
      case 'left':
        return {
          x: -myWidth,
          y: offset,
        };
      case 'right':
        return {
          x: theirWidth,
          y: offset,
        };
      default:
        return {
          x: 0,
          y: 0,
        };
    }
  },
);

const makeSelectMainMap = () => (state) => state.data.present;

const makeSelectMainMapDimensions = () => createSelector(
  makeSelectMainMap(),
  selectMapDimensions(),
);

const makeSelectMainMapBlocksets = () => createSelector(
  makeSelectMainMap(),
  makeSelectMapBlocksets(),
);

const makeSelectMainMapData = () => createSelector(
  makeSelectMainMap(),
  selectMapData(),
);

const makeSelectMainMapEntities = () => createSelector(
  makeSelectMainMap(),
  R.prop('entities'),
);

const makeSelectConnectedMap = (dimensions) => createStructuredSelector({
  map: selectMapData(),
  blocksets: makeSelectMapBlocksets(),
  position: makeSelectConnectionPosition(dimensions),
});

const makeSelectConnectedMaps = () => createArraySelector(
  (state) => state.data.present.connections,
  makeSelectMainMapDimensions(),
  (connection, dimensions) => makeSelectConnectedMap(dimensions)(connection),
);

const makeSelectConnectedMapObjects = () => (state) => state.data.present.connections;

export {
  makeSelectMainMapBlocksets,
  makeSelectMainMapData,
  makeSelectConnectedMaps,
  makeSelectConnectedMapObjects,
  makeSelectMainMapDimensions,
  makeSelectMainMapEntities,
};
