import React from 'react';
import { createStructuredSelector } from 'reselect';

import { HTML3D } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import type { Tool, Dispatch } from '../tools/types';
import { makeSelectActiveTool, makeSelectToolState, makeSelectToolMeta } from '../selectors/editingSelectors';

/**
 * A component that runs the majority of tool events
 */
export class ToolHitBox extends React.PureComponent {
  props: {
    width: number;
    height: number;
    x: number;
    y: number;
    objectType: string;
    tabDispatch: Dispatch;
    activeTool: Tool<Object>;
    toolState: Object;
    toolMeta: Object;
    object: Object,
  };

  render() {
    const { x, y, width, height, objectType, object: objectData } = this.props;

    const object = {
      type: objectType,
      data: objectData,
    };

    const style = {
      width,
      height,
      cursor: this.props.activeTool
        ? this.props.activeTool.getCursorForObject(object, this.props.toolState)
        : 'auto',
    };

    const onMouseDown = (event) => this.props.activeTool.onMouseDown(
      object,
      this.props.toolState,
      this.props.toolMeta,
      this.props.tabDispatch,
      event,
    );

    return (
      <HTML3D width={width} height={height} x={x} y={y}>
        <div // eslint-disable-line jsx-a11y/no-static-element-interactions
          onMouseDown={this.props.activeTool && onMouseDown}
          style={style}
        />
      </HTML3D>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  activeTool: makeSelectActiveTool(),
  toolState: makeSelectToolState(),
  toolMeta: makeSelectToolMeta(),
});

function mapTabDispatchToProps(tabDispatch) {
  return {
    tabDispatch,
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(ToolHitBox);
