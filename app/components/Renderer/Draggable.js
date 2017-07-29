/* @flow */

import React from 'react';

import GridArea from './GridArea';
import Group from './Group';

type PropTypes = {
  /* onMouseDown: EventCallback;
   * onMouseMove: EventCallback;
   * onMouseUp: EventCallback;*/
  gridHeight: number;
  gridWidth: number;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  name: string;
  children: ReactElement,
};


export default class Draggable extends React.PureComponent {
  static defaultProps = {
    x: 0,
    y: 0,
    z: Infinity,
    name: '',
    /* onMouseDown: nop,
     * onMouseMove: nop,
     * onMouseUp: nop,*/
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

  handleDrag = (start, end, event) => {
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
