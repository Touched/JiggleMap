/* @flow */

import * as React from 'react';
import classNames from 'classnames';
import CloseIcon from 'mdi-react/CloseIcon';
import AsteriskIcon from 'mdi-react/AsteriskIcon';

import nop from 'utils/nop';

export default class EditorTab extends React.PureComponent<*, *> {
  static defaultProps = {
    onClose: nop,
    onSelect: nop,
    onMouseDown: nop,
    tabRef: nop,
    active: false,
    dirty: false,
    style: {},
  };

  props: {
    title: string,
    tabRef: (React.ElementRef<*> | null) => void,
    onClose: (Event) => void,
    onSelect: (Event) => void,
    onMouseDown: (MouseEvent) => void,
    active: boolean,
    dirty: boolean,
    style: Object,
  };

  handleClose = (event: Event) => {
    this.props.onClose(event);
    event.stopPropagation();
  };

  handleMouseDown = (event: MouseEvent) => {
    this.props.onSelect(event);
    this.props.onMouseDown(event);
  };

  render() {
    const { title, active, onSelect, style, tabRef, dirty } = this.props;

    return (
      <div
        tabIndex={0}
        onClick={onSelect}
        onMouseDown={this.handleMouseDown}
        className={classNames('EditorTabsBar__tab', { 'EditorTabsBar__tab--active': active })}
        role="tab"
        style={style}
        ref={tabRef}
      >
        <div className="EditorTabsBar__tab__label">{title}</div>
        <button onClick={this.handleClose} className="EditorTabsBar__tab__close">
          {dirty ? <AsteriskIcon /> : <CloseIcon />}
        </button>
      </div>
    );
  }
}
