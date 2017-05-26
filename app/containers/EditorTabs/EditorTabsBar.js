/*
 *
 * EditorTabs
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { createStructuredSelector } from 'reselect';
import classNames from 'classnames';
import { fromJS } from 'immutable';
import TabPlusIcon from 'mdi-react/TabPlusIcon';

import { newTab, closeTab, switchTab, reorderTabs } from './actions';
import makeSelectEditorTabs, { makeSelectEditorTabsActiveIndex } from './selectors';
import EditorTab from './EditorTab';
import './styles.scss';

const TRANSITION_ENTER_TIMEOUT = 100;
const TRANSITION_LEAVE_TIMEOUT = 100;

export function reorderElement(list, element, shift) {
  const index = list.indexOf(element);

  if (index < 0) {
    return list;
  }

  const newIndex = Math.max(0, Math.min(index + shift, list.length));

  return fromJS(list).delete(index).insert(newIndex, element).toJS();
}

export class EditorTabsBar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onCloseTab: PropTypes.func,
    onNewTab: PropTypes.func,
    onSwitchTab: PropTypes.func,
    onReorder: PropTypes.func,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string,
      dirty: PropTypes.bool,
    })).isRequired,
    activeTab: PropTypes.string,
  };

  static defaultProps = {
    onCloseTab: null,
    onNewTab: null,
    onSwitchTab: null,
    onReorder: null,
    activeTab: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      dragging: null,
      closing: null,
    };
  }

  handleClose = (event, id) => {
    this.props.onCloseTab(id);
    const { width } = this.tabRef.getBoundingClientRect();

    this.setState((state) => ({
      ...state,
      closing: {
        width,
      },
    }));
  };

  handleDragStart = ({ currentTarget, clientX }, id) => {
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

  handleDragMove = (event) => {
    if (this.state.closing) {
      this.setState((state) => ({
        ...state,
        closing: null,
      }));
    }

    if (this.state.dragging !== null) {
      const { dragging } = this.state;
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

        const translate = clientX - this.state.dragging.x;

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
      >
        <CSSTransitionGroup
          transitionName="EditorTabsBar__tab-"
          transitionEnterTimeout={TRANSITION_ENTER_TIMEOUT}
          transitionLeaveTimeout={TRANSITION_LEAVE_TIMEOUT}
          component="div"
          className={classNames('EditorTabsBar', classes)}
        >
          {tabs.map(({ id, ...props }) => {
            const isDragging = this.state.dragging;
            const isClosing = this.state.closing;
            const isDraggingTab = isDragging && this.state.dragging.id === id;

            const styles = {};

            if (isClosing) {
              styles.maxWidth = `${this.state.closing.width}px`;
            } else if (isDraggingTab) {
              styles.transform = `translate(${this.state.dragging.translate}px)`;
            } else if (isDragging) {
              const index = this.state.dragging.order.indexOf(id);
              const originalIndex = this.props.tabs.map(({ id: tabId }) => tabId).indexOf(id);
              const distance = index - originalIndex;
              styles.transform = `translate(${distance * this.state.dragging.rect.width}px)`;
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
          <button onClick={onNewTab} className="EditorTabsBar__add">
            <TabPlusIcon />
          </button>
        </CSSTransitionGroup>
      </div>
    );
  }
}

export const mapStateToProps = createStructuredSelector({
  tabs: makeSelectEditorTabs(),
  activeTab: makeSelectEditorTabsActiveIndex(),
});

export function mapDispatchToProps(dispatch) {
  return {
    onNewTab() {
      dispatch(newTab());
    },
    onCloseTab(id) {
      dispatch(closeTab(id));
    },
    onSwitchTab(id) {
      dispatch(switchTab(id));
    },
    onReorder(order) {
      dispatch(reorderTabs(order));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorTabsBar);
