import React from 'react';
import classNames from 'classnames';

import allTools from './tools';
import { setActiveTool } from './actions';

type Props = {
  tabDispatch: ({ type: string }) => void,
  selectedTool: string
};

function handleToolClick(tool, tabDispatch) {
  switch (tool.type) {
    case 'action':
      tabDispatch(tool.action());
      break;
    case 'mouse':
      tabDispatch(setActiveTool(tool.id));
      break;
    default:
      break;
  }
}

export default function ToolBox(props: Props) {
  const { selectedTool, tabDispatch } = props;

  return (
    <div className="MapEditor__OverlayBox ToolBox">
      {allTools.map((tool) => tool.type === 'separator' ? <div className="ToolBox__separator" /> : (
        <button
          className={classNames({ active: selectedTool === tool.id })}
          onClick={() => handleToolClick(tool, tabDispatch)}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
