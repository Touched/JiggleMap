import React from 'react';
import { Button } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/labs';

import SpritePicker from './SpritePicker';
import Sprite from './Sprite';
import styles from './styles.scss';

import type { SpriteObject } from './Sprite';

export default class SpritePickerField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  getSelectedSprite() {
    const { sheet } = this.props;

    const { x, y, width, height, id } = this.props.value;

    return (
      <Button className={styles.spritePickerFieldButton} onKeyDown={this.handleKeyDown}>
        <div className={styles.spritePickerFieldButtonSprite}>
          <Sprite x={x} y={y} width={width} height={height} sheet={sheet} />
        </div>
        <span className="pt-monospace-text">{id}</span>
      </Button>
    );
  }

  props: {
    sheet: string;
    sprites: Array<SpriteObject>;
    onChange: Function;
    categories: Array<{id: string, name: string}>;
    value: SpriteObject; // eslint-disable-line react/no-unused-prop-types
  };

  refHandlers = {
    input: (ref) => {
      this.input = ref;
    },
    queryList: (ref) => {
      this.queryList = ref;
    },
  };

  handlePopoverWillOpen = () => {
    this.previousFocusedElement = document.activeElement;
  };

  handlePopoverDidOpen = () => {
    if (this.queryList) {
      this.queryList.scrollActiveItemIntoView();
    }

    // Wait for the ref to be set
    requestAnimationFrame(() => {
      if (this.input !== null) {
        this.input.focus();
      }
    });
  };

  handlePopoverWillClose = () => {
    requestAnimationFrame(() => {
      if (this.previousFocusedElement !== undefined) {
        this.previousFocusedElement.focus();
        this.previousFocusedElement = undefined;
      }
    });
  };

  handleKeyDown = (event) => {
    if (event.which === 38 || event.which === 40) {
      this.setState({ isOpen: true });
    }
  };

  handlePopoverInteraction = (isOpen) => {
    this.setState({ isOpen });
  };

  handleSpriteChange = (sprite, event) => {
    if (sprite && typeof sprite !== 'string') {
      this.setState({ isOpen: false });
      this.props.onChange(sprite, event);
    }
  };

  render() {
    const { sheet, sprites, categories, value } = this.props;

    const content = (
      <SpritePicker
        sheet={sheet}
        sprites={sprites}
        categories={categories}
        onChange={this.handleSpriteChange}
        value={value}
        inputRef={this.refHandlers.input}
        queryListRef={this.refHandlers.queryList}
      />
    );

    return (
      <Popover2
        content={content}
        autoFocus={false}
        enforceFocus={false}
        popoverWillOpen={this.handlePopoverWillOpen}
        popoverDidOpen={this.handlePopoverDidOpen}
        popoverWillClose={this.handlePopoverWillClose}
        onInteraction={this.handlePopoverInteraction}
        isOpen={this.state.isOpen}
      >
        {this.getSelectedSprite()}
      </Popover2>
    );
  }
}
