/* @flow */

import React from 'react';
import nop from 'utils/nop';

import { AreaEvent } from './Area';
import GridArea from './GridArea';

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
  onDrag: (Position, Position, AreaEvent) => void;
  onDragStart: (Position, Position, AreaEvent) => void;
  onDragEnd: (Position, Position, AreaEvent) => void;
};


export default class DraggableArea extends React.PureComponent {
  static defaultProps = {
    x: 0,
    y: 0,
    z: Infinity,
    name: '',
    gridWidth: 16,
    gridHeight: 16,
    onDrag: nop,
    onDragStart: nop,
    onDragEnd: nop,
  };

  constructor(props: PropTypes, context) {
    super(props, context);
    this.state = {
      dragging: false,
    };
  }

  handleDragStart = (start, end, event) => {
    this.props.onDragStart(start, end, event);
    this.setState(() => ({
      dragging: true,
    }));

    event.stopPropagation();
  };

  handleDrag = (start: Position, end: Position, event: AreaEvent) => {
    this.props.onDrag(start, end, event);
    event.stopPropagation();
  };

  handleDragEnd = (start: Position, end: Position, event: AreaEvent) => {
    this.props.onDragEnd(start, end, event);
    this.setState(() => ({
      dragging: false,
    }));
  };

  render() {
    const { x, y, z, name, width, height, gridWidth, gridHeight } = this.props;

    return (
      <GridArea
        x={x}
        y={y}
        z={z}
        onMouseDown={this.handleDragStart}
        onMouseMove={this.handleDrag}
        onMouseUp={this.handleDragEnd}
        name={name}
        width={width}
        height={height}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
      />
    );
  }
}
