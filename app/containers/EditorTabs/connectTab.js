/* @flow */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { makeSelectEditorTabsTabStateDomain } from './selectors';
import { relayActionToTab } from './actions';

function tryCallMapper(mapper, ...args) {
  if (mapper) {
    return mapper(...args);
  }

  return {};
}

type Dispatch = ({ type: string }) => void;
type MapStateToProps = (any, Object, string) => Object;
type MapDispatchToProps = (Dispatch, Object, string) => Object;

/**
 * Connect a component to the Redux store, passing the `tabId` down in its React context to the
 * provided `mapStateToProps` and `mapDispatchToProps` functions. It also provides additional mapping
 * functions (`mapTabStateToProps` and `mapTabDispatchToProps`) to allow selectors to select tab
 * state and dispatch tab actions.
 *
 * The signature for `mapStateToProps` becomes:
 *   (state, ownProps, tabId) => stateProps
 *
 * This is the same as the mapStateToProps from `react-redux`, but it has access to the `tabId`.
 *
 * The signature for `mapTabStateToProps` is:
 *   (tabState, ownProps, tabId) => tabStateProps
 *
 * Where `tabState` is the state for the tab with id `tabId`.
 *
 * The signature for `mapDispatchToProps` becomes:
 *   (dispatch, ownProps, tabId) => dispatchProps
 *
 * This is the same as the mapDispatchToProps from `react-redux`, but it has access to the `tabId`.
 *
 * The signature for `mapTabDispatchToProps` is:
 *   (tabDispatch, ownProps, tabId) => tabDispatchProps
 *
 * Where `tabDispatch` is a wrapper around `dispatch` which dispatches an action to a specific tab,
 * (via the `relayActionToTab` action).
 *
 * Any of these mapping functions can be omitted, as in the regular `connect` from `react-redux`.
 */
export default function connectTab(
  mapStateToProps: ?MapStateToProps,
  mapTabStateToProps: ?MapStateToProps,
  mapDispatchToProps: ?MapDispatchToProps,
  mapTabDispatchToProps: ?MapDispatchToProps,
) {
  function wrappedMapStateToProps(state: any, { tabId, ...ownProps }: { tabId: string }) {
    const selector = makeSelectEditorTabsTabStateDomain(tabId);

    const stateProps = tryCallMapper(mapStateToProps, state, ownProps, tabId);
    const tabStateProps = tryCallMapper(mapTabStateToProps, selector(state), ownProps, tabId);

    return {
      ...stateProps,
      ...tabStateProps,
    };
  }

  function wrappedMapDispatchToProps(dispatch, { tabId, ...ownProps }) {
    function tabDispatch(action) {
      return dispatch(relayActionToTab(tabId, action));
    }

    const dispatchProps = tryCallMapper(mapDispatchToProps, dispatch, ownProps, tabId);
    const tabDispatchProps = tryCallMapper(mapTabDispatchToProps, tabDispatch, ownProps, tabId);

    return {
      ...dispatchProps,
      ...tabDispatchProps,
    };
  }

  function mergeProps(stateProps, dispatchProps, { tabId, ...ownProps }) {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
    };
  }

  const connectComponent = connect(wrappedMapStateToProps, wrappedMapDispatchToProps, mergeProps);

  return (WrappedComponent: Class<React$Component<*, *, *>>) => {
    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const ConnectedComponent = connectComponent(WrappedComponent);

    class ConnectTab extends React.Component { // eslint-disable-line react/prefer-stateless-function
      static displayName = `ConnectTab(${wrappedComponentName})`;

      static contextTypes = {
        tabId: PropTypes.string,
      };

      render() {
        return <ConnectedComponent {...this.props} tabId={this.context.tabId} />;
      }
    }

    return ConnectTab;
  };
}
