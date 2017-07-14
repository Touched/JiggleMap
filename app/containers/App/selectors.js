import R from 'ramda';

// makeSelectLocationState expects a plain JS object for the routing state
const makeSelectLocationState = () => {
  let prevRoutingState;

  return (state) => {
    const routingState = state.route;

    if (!R.equals(routingState, prevRoutingState)) {
      prevRoutingState = routingState;
    }

    return prevRoutingState;
  };
};

const makeSelectSidebarItem = () => (state) => state.project.sidebarItem;

const makeSelectEntities = (type) =>
  (state) => Object.values(state.project.entities[type]);

const makeSelectEntity = (type, id) =>
  (state) => state.project.entities[type][id];

export {
  makeSelectEntity,
  makeSelectEntities,
  makeSelectLocationState,
  makeSelectSidebarItem,
};
