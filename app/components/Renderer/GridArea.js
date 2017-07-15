/* @flow */

import React from 'react';
import nop from 'utils/nop';

import Area, { AreaEvent } from './Area';

type Position = {
  x: number;
  y: number;
};

type EventCallback = (Position, Position, AreaEvent) => void;

type PropTypes = {
  onMouseDown: EventCallback;
  onMouseMove: EventCallback;
  onMouseUp: EventCallback;
  gridHeight: number;
  gridWidth: number;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  name: string;
};

/**
 * A hit region that only fires events when the cursor moves to another cell in the grid.
 */
export default class GridArea extends React.PureComponent {
  static defaultProps = {
    x: 0,
    y: 0,
    z: Infinity,
    name: '',
    onMouseDown: nop,
    onMouseMove: nop,
    onMouseUp: nop,
    gridWidth: 16,
    gridHeight: 16,
  };

  constructor(props: PropTypes) {
    super(props);
    this.state = {
      dragging: null,
    };
  }

  state: {
    dragging: ?{
      start: Position;
      end: Position;
    };
  };

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseDown = (event: AreaEvent) => {
    const { x, y } = event;
    const pos = this.calculatePos(x, y);

    this.props.onMouseDown(pos, pos, event);

    this.setState((state) => ({
      ...state,
      dragging: {
        start: pos,
        end: pos,
      },
    }));
  };

  onMouseMove = (event: AreaEvent) => {
    if (this.state.dragging) {
      const { x, y } = event;
      const { end: prev, start } = this.state.dragging;
      const current = this.calculatePos(x, y);

      if (current.x !== prev.x || current.y !== prev.y) {
        this.props.onMouseMove(start, current, event);

        this.setState((state) => ({
          ...state,
          dragging: {
            ...state.dragging,
            end: current,
          },
        }));
      }
    }
  };

  onMouseUp = (event: AreaEvent) => {
    const { dragging } = this.state;

    if (dragging) {
      this.props.onMouseUp(dragging.start, dragging.end, event);
    }

    this.setState((state) => ({
      ...state,
      dragging: null,
    }));
  };

  calculatePos(x: number, y: number): Position {
    const { gridWidth, gridHeight } = this.props;

    return {
      x: Math.floor(x / gridWidth),
      y: Math.floor(y / gridHeight),
    };
  }

  props: PropTypes;

  render() {
    const { name, width, height, x, y, z } = this.props;

    return (
      <Area
        x={x}
        y={y}
        z={z}
        width={width}
        height={height}
        name={name}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
      />
    );
  }
}