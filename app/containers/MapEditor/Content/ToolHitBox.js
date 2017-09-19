import React from 'react';
import { createStructuredSelector } from 'reselect';

import { HTML3D } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';

import type { Tool, Dispatch } from '../tools/types';
import { makeSelectActiveTool, makeSelectToolState, makeSelectToolMeta } from '../selectors';

/**
 * A component that runs the majority of tool events
 */
export class ToolHitBox extends React.PureComponent {
  props: {
    width: number;
    height: number;
    objectType: string;
    tabDispatch: Dispatch;
    activeTool: Tool<Object>;
    toolState: Object;
    toolMeta: Object;
  };

  render() {
    const { width, height, objectType } = this.props;

    const object = {
      type: objectType,
    };

    const style = {
      width,
      height,
      cursor: this.props.activeTool ? this.props.activeTool.getCursorForObject(object) : 'auto',
    };

    const onMouseDown = (event) => this.props.activeTool.onMouseDown(
      object,
      this.props.toolState,
      this.props.toolMeta,
      this.props.tabDispatch,
      event,
    );

    return (
      <HTML3D width={width} height={height}>
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