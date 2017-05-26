import { Map } from 'immutable';

// makeSelectLocationState expects a plain JS object for the routing state
const makeSelectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route'); // or state.route

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

const makeSelectSidebarItem = () => (state) => state.get('project').get('sidebarItem');

const makeSelectEntities = (type) =>
  (state) => state.getIn(['project', 'entities', type], Map([])).valueSeq().toJS();

const makeSelectEntity = (type, id) =>
  (state) => state.getIn(['project', 'entities', type, id]).toJS();

export {
  makeSelectEntity,
  makeSelectEntities,
  makeSelectLocationState,
  makeSelectSidebarItem,
};
