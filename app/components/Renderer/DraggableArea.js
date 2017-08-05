/* @flow */

import React from 'react';
import nop from 'utils/nop';

import { AreaEvent } from './Area';
import GridArea from './GridArea';

type Position = {
  x: number;
  y: number;
};

type Props = {
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

type DefaultProps = {
  x: number;
  y: number;
  z: number;
  name: string;
  gridHeight: number;
  gridWidth: number;
  onDrag: (Position, Position, AreaEvent) => void;
  onDragStart: (Position, Position, AreaEvent) => void;
  onDragEnd: (Position, Position, AreaEvent) => void;
};

type State = {
  dragging: boolean;
  cursor: ?string;
};

export default class DraggableArea extends React.PureComponent<DefaultProps, Props, State> {
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

  constructor(props: Props) {
    super(props);
    this.state = {
      dragging: false,
      cursor: null,
    };
  }

  state: State;

  handleDragStart = (start: Position, end: Position, event: AreaEvent) => {
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
        cursor="-webkit-grab"
        cursorHeld="-webkit-grabbing"
      />
    );
  }
}
