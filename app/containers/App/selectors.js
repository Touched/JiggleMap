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

const makeSelectResources = (type) =>
  (state) => Object.values(state.project.resources[type]);

const makeSelectResource = (type, id) =>
  (state) => state.project.resources[type][id];

export {
  makeSelectResource,
  makeSelectResources,
  makeSelectLocationState,
  makeSelectSidebarItem,
};
