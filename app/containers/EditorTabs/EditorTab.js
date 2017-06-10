import React, { PropTypes } from 'react';
import classNames from 'classnames';
import CloseIcon from 'mdi-react/CloseIcon';
import AsteriskIcon from 'mdi-react/AsteriskIcon';

export default class EditorTab extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    onSelect: PropTypes.func,
    onMouseDown: PropTypes.func,
    tabRef: PropTypes.func,
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    style: PropTypes.object,
  };

  static defaultProps = {
    onClose: null,
    onSelect: null,
    onMouseDown: null,
    tabRef: null,
    active: false,
    dirty: false,
    style: {},
  };

  handleClose = (event) => {
    this.props.onClose(event);
    event.stopPropagation();
  };

  handleMouseDown = (event) => {
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
