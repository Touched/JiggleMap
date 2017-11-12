/* @flow */

/*
 *
 * EditorTabs
 *
 */

import React from 'react';
import invariant from 'invariant';
import { connect } from 'react-redux';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { createStructuredSelector } from 'reselect';
import classNames from 'classnames';
import { Button, Classes } from '@blueprintjs/core';

import { newTab, closeTab, switchTab, reorderTabs } from './actions';
import makeSelectEditorTabs, { makeSelectEditorTabsActiveIndex } from './selectors';
import EditorTab from './EditorTab';
import './styles.scss';

const TRANSITION_ENTER_TIMEOUT = 100;
const TRANSITION_LEAVE_TIMEOUT = 100;

export function reorderElement<T>(list: Array<T>, element: T, shift: number) {
  const index = list.indexOf(element);

  if (index < 0) {
    return list;
  }

  const newIndex = Math.max(0, Math.min(index + shift, list.length));

  list.splice(newIndex, 0, list.splice(index, 1)[0]);
  return list;
}

type Tab = {
  id: string,
  title: string,
  icon: ?string,
  dirty: bool,
};

export class EditorTabsBar extends React.PureComponent<*, *> {
  static defaultProps = {
    onCloseTab: null,
    onNewTab: null,
    onSwitchTab: null,
    onReorder: null,
    activeTab: null,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      dragging: null,
      closing: null,
    };
  }

  state: {
    dragging: ?{
      id: string,
      rect: {
        left: number,
        right: number,
        width: number,
      },
      x: number,
      translate: number,
      order: Array<string>,
      moved: boolean,
    },
    closing: ?{
      width: number,
    },
  };

  props: {
    onCloseTab: (string) => void,
    onNewTab: () => void,
    onSwitchTab: (string) => void,
    onReorder: (Array<string>) => void,
    tabs: Array<Tab>,
    activeTab: string,
  }

  tabRef: HTMLElement;
  ref: ?HTMLElement;

  handleClose = (event: Event, id: string) => {
    this.props.onCloseTab(id);
    const { width } = this.tabRef.getBoundingClientRect();

    this.setState((state) => ({
      ...state,
      closing: {
        width,
      },
    }));
  };

  handleDragStart = (event: MouseEvent & { currentTarget: HTMLElement }, id: string) => {
    const { currentTarget, clientX } = event;
    invariant(currentTarget instanceof HTMLElement, 'Event target was not an HTML element');

    const rect = currentTarget.getBoundingClientRect();
    const order = this.props.tabs.map(({ id: tabId }) => tabId);

    this.setState((state) => ({
      ...state,
      dragging: {
        id,
        rect,
        x: clientX,
        translate: 0,
        order,
        moved: false,
      },
    }));
  };

  handleDragMove = (event: MouseEvent) => {
    if (this.state.closing) {
      this.setState((state) => ({
        ...state,
        closing: null,
      }));
    }

    const { dragging } = this.state;

    if (dragging) {
      invariant(this.ref, 'The tab bar ref was not properly set');

      const { clientX } = event;
      const { left, right } = this.ref.getBoundingClientRect();

      // Calculate the position of the edges of the tab currently being dragged
      const leftmostEdge = (dragging.rect.left + clientX) - dragging.x;
      const rightmostEdge = (dragging.rect.right + clientX) - dragging.x;
      const { width: tabWidth } = dragging.rect;

      // Ensure the tab cannot be dragged outside the bounds of the tabs container
      if (leftmostEdge >= left && rightmostEdge <= right) {
        // If the leftmost edge of the tab crosses this point, swap the tab
        const tabX = left + (tabWidth * dragging.order.indexOf(dragging.id));
        const leftSwapPoint = tabX - (tabWidth / 2);
        const rightSwapPoint = tabX + tabWidth + (tabWidth / 2);

        const leftSwap = leftmostEdge < leftSwapPoint;
        const rightSwap = rightmostEdge >= rightSwapPoint;

        if (leftSwap || rightSwap) {
          this.setState((state) => ({
            ...state,
            dragging: {
              ...state.dragging,
              order: reorderElement(state.dragging.order, state.dragging.id, leftSwap ? -1 : 1),
            },
          }));
        }

        const translate = clientX - dragging.x;

        this.setState((state) => ({
          ...state,
          dragging: {
            ...state.dragging,
            translate,
            moved: state.dragging.moved || translate !== 0,
          },
        }));
      }
    }
  };

  handleDragEnd = () => {
    if (this.state.dragging) {
      this.props.onReorder(this.state.dragging.order);

      this.setState((state) => ({
        ...state,
        dragging: null,
      }));
    }
  };

  render() {
    const { tabs, onNewTab, activeTab, onSwitchTab } = this.props;

    const classes = {
      'EditorTabsBar--dragging': this.state.dragging && this.state.dragging.moved,
    };

    return (
      <div
        tabIndex={-1}
        role="tablist"
        onMouseLeave={this.handleDragEnd}
        onMouseUp={this.handleDragEnd}
        onMouseMove={this.handleDragMove}
        ref={(ref) => { this.ref = ref; }}
        className="EditorTabsBar__container"
      >
        <CSSTransitionGroup
          transitionName="EditorTabsBar__tab-"
          transitionEnterTimeout={TRANSITION_ENTER_TIMEOUT}
          transitionLeaveTimeout={TRANSITION_LEAVE_TIMEOUT}
          component="div"
          className={classNames('EditorTabsBar', classes)}
        >
          {tabs.map(({ id, ...props }) => {
            const { closing, dragging } = this.state;
            const styles = {};

            if (closing) {
              styles.maxWidth = `${closing.width}px`;
            } else if (dragging && dragging.id === id) {
              styles.transform = `translate(${dragging.translate}px)`;
            } else if (dragging) {
              const index = dragging.order.indexOf(id);
              const originalIndex = this.props.tabs.map(({ id: tabId }) => tabId).indexOf(id);
              const distance = index - originalIndex;
              styles.transform = `translate(${distance * dragging.rect.width}px)`;
            }

            return (
              <EditorTab
                key={id}
                tabRef={(ref) => { this.tabRef = ref; }}
                active={id === activeTab}
                onSelect={() => onSwitchTab(id)}
                onMouseDown={(event) => this.handleDragStart(event, id)}
                onClose={(event) => this.handleClose(event, id)}
                style={styles}
                {...props}
              />
            );
          })}
          <Button
            onClick={onNewTab}
            iconName={'add'}
            className={classNames(Classes.MINIMAL, 'EditorTabsBar__add')}
          />
        </CSSTransitionGroup>
      </div>
    );
  }
}

export const mapStateToProps = createStructuredSelector({
  tabs: makeSelectEditorTabs(),
  activeTab: makeSelectEditorTabsActiveIndex(),
});

export function mapDispatchToProps(dispatch: Function) {
  return {
    onNewTab() {
      dispatch(newTab());
    },
    onCloseTab(id: string) {
      dispatch(closeTab(id));
    },
    onSwitchTab(id: string) {
      dispatch(switchTab(id));
    },
    onReorder(order: Array<string>) {
      dispatch(reorderTabs(order));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorTabsBar);
