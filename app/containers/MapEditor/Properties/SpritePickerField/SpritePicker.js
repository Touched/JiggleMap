import React from 'react';
import R from 'ramda';
import { Button, Classes } from '@blueprintjs/core';
import { QueryList } from '@blueprintjs/labs';
import classNames from 'classnames';
import fuzzy from 'fuzzy';
import invariant from 'invariant';

import styles from './styles.scss';

type SpriteProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  sheet: string,
};

function Sprite({ x, y, width, height, sheet }: SpriteProps) {
  const style = {
    background: `url(${sheet})`,
    backgroundPositionX: -x,
    backgroundPositionY: -y,
    minWidth: width,
    minHeight: height,
  };

  return (
    <div style={style} />
  );
}

type SpriteButtonProps = {
  onMouseOver: Function;
  onMouseLeave: Function;
  onClick: Function;
  active: bool;
} & SpriteProps;

function SpriteButton(props: SpriteButtonProps) {
  return (
    <Button
      className={classNames(Classes.MINIMAL, { [Classes.ACTIVE]: props.active })}
      style={{ display: 'inline-block', padding: 8 }}
      onMouseOver={props.onMouseOver}
      onMouseLeave={props.onMouseLeave}
      onClick={props.onClick}
    >
      <Sprite {...props} />
    </Button>
  );
}

export default class SpritePicker extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      selectedSprite: null,
      query: '',
      items: this.updateSpriteList(props.sprites),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sprites !== nextProps.sprites) {
      this.setState({
        items: this.updateSpriteList(this.props.sprites),
      });
    }
  }

  getCategoryName = (category) => {
    const data = this.props.categories.find(({ id }) => id === category);

    invariant(data, 'Category `%s` is not defined', category);

    return data.name;
  };

  getCategoryOrder = ({ category }) => {
    const index = this.props.categories.findIndex(({ id }) => id === category);

    invariant(index >= 0, 'Category `%s` is not defined', category);

    return index;
  };

  handleQueryChange = ({ target }) => {
    this.setState({
      query: target.value,
    });
  };

  handleActiveItemChange = (value) => {
    // TODO: Skip category labels
    this.setState({
      activeItem: value,
    });
  };

  listPredicate(query, items) {
    const searchResults = items.reduce((results, item) => {
      // Always show category labels
      if (typeof item === 'string') {
        // Avoid displaying empty categories
        if (typeof results[results.length - 1] === 'string') {
          return [
            ...results.slice(0, -1),
            item,
          ];
        }

        return [
          ...results,
          item,
        ];
      }

      return fuzzy.match(query, item.id) !== null ? [
        ...results,
        item,
      ] : results;
    }, []);


    // Don't show an empty category at the end
    if (searchResults[searchResults.length - 1]) {
      return searchResults.slice(0, -1);
    }

    return searchResults;
  }

  props: {
    sprites: string;
    sheet: string;
    onChange: Function;
    categories: Array<{id: string, name: string}>;
  };

  handleHoverSprite = (id) => {
    this.setState({
      selectedSprite: this.props.sprites.find((sprite) => sprite.id === id),
    });
  };

  handleLeaveSprite = () => {
    this.setState({
      selectedSprite: null,
    });
  };

  updateSpriteList(sprites) {
    const sortedItems = R.sortBy(this.getCategoryOrder, sprites);

    return R.unnest(R.chain(([key, category]) => [
      key,
      category,
    ], R.toPairs(R.groupBy(R.prop('category'), sortedItems))));
  }

  renderPicker = ({ handleItemSelect, filteredItems, query, activeItem, handleKeyDown, handleKeyUp, itemsParentRef }) => {
    const sprites = filteredItems.map((sprite) => typeof sprite === 'object' ? (
      <SpriteButton
        key={sprite.id}
        sheet={this.props.sheet}
        x={sprite.x}
        y={sprite.y}
        width={sprite.width}
        height={sprite.height}
        onMouseOver={() => this.handleHoverSprite(sprite.id)}
        onMouseLeave={() => this.handleLeaveSprite(sprite.id)}
        onClick={(event) => handleItemSelect(sprite, event)}
        active={activeItem && activeItem.id === sprite.id}
      />
    ) : (
      <div key={sprite} className={styles.heading}>{this.getCategoryName(sprite)}</div>
    ));

    const selected = this.state.selectedSprite;

    const details = selected ? (
      <div className={styles.footer}>
        <Sprite
          sheet={this.props.sheet}
          x={selected.x}
          y={selected.y}
          width={selected.width}
          height={selected.height}
        />
        <div className={styles.footerDetails}>
          <div className={classNames('pt-monospace-text', 'pt-text-muted', styles.footerId)}>{selected.id}</div>
          <div className={styles.footerLabel}>{selected.name}</div>
          <div className={styles.footerDescription}>{selected.description}</div>
        </div>
      </div>
    ) : null;

    return (
      <div
        className={styles.spritePicker}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        tabIndex="-1"
        role="button"
      >
        <div className={styles.search}>
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-search"></span>
            <input
              className="pt-input"
              type="text"
              placeholder="Filter..."
              dir="auto"
              value={query}
              onChange={this.handleQueryChange}
            />
          </div>
        </div>
        <div className={styles.list} ref={itemsParentRef}>
          {sprites}
        </div>
        {details}
      </div>
    );
  };

  render() {
    const { onChange } = this.props;

    return (
      <QueryList
        items={this.state.items}
        onActiveItemChange={this.handleActiveItemChange}
        onItemSelect={onChange}
        renderer={this.renderPicker}
        query={this.state.query}
        itemListPredicate={this.listPredicate}
        activeItem={this.state.activeItem}
      />
    );
  }
}
