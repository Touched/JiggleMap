/* @flow */

import React from 'react';

import { AreaEvent } from './Area';
import GridArea from './GridArea';
import Group from './Group';

type Position = {
  x: number;
  y: number;
};

type PropTypes = {
  gridHeight: number;
  gridWidth: number;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  name: string;
  children: ReactElement,
  onDrag: (Position, Position, AreaEvent) => void;
};


export default class DraggableArea extends React.PureComponent {
  static defaultProps = {
    x: 0,
    y: 0,
    z: Infinity,
    name: '',
    gridWidth: 16,
    gridHeight: 16,
  };

  constructor(props: PropTypes, context) {
    super(props, context);
    this.state = {
      dragging: false,
    };
  }

  handleDragStart = (start, end, event) => {
    this.setState(() => ({
      dragging: true,
    }));

    event.stopPropagation();
  };

  handleDrag = (start: Position, end: Position, event: AreaEvent) => {
    this.props.onDrag(start, end, event);
    event.stopPropagation();
  };

  handleDragEnd = () => {
    this.setState(() => ({
      dragging: false,
    }));
  };

  render() {
    const { x, y, z, name, width, height, gridWidth, gridHeight } = this.props;

    return (
      <Group x={x * gridHeight} y={y * gridHeight} z={z}>
        {React.Children.only(this.props.children)}
        <GridArea
          onMouseDown={this.handleDragStart}
          onMouseMove={this.handleDrag}
          name={name}
          width={width}
          height={height}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
        />
      </Group>
    );
  }
}
