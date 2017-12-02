/* @flow */

import * as React from 'react';
import classNames from 'classnames';
import { Button, Classes } from '@blueprintjs/core';

import nop from 'utils/nop';
import styles from './styles.scss';

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
        className={classNames(styles.tab, { [styles.tabActive]: active })}
        role="tab"
        style={style}
        ref={tabRef}
      >
        <div className={styles.tabLabel}>{title}</div>
        <Button onClick={this.handleClose} iconName={dirty ? 'asterisk' : 'cross'} className={Classes.MINIMAL} />
        <div className={styles.activeIndicator} />
      </div>
    );
  }
}
