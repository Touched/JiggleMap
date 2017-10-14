import React from 'react';
import classNames from 'classnames';
import R from 'ramda';

import allTools from './tools';
import { setActiveTool } from './actions';

type Props = {
  tabDispatch: ({ type: string }) => void;
  selectedTool: {
    id: string; // eslint-disable-line react/no-unused-prop-types
  };
  activeLayer: string;
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

const typeOrders = ['mouse', 'action'];

export function buildToolListForLayer(tools, layer) {
  const layersContainLayer = R.compose(R.contains(layer), R.prop('layers'));
  const typeOrderIndex = R.compose(R.indexOf(R.__, typeOrders), R.prop('type')); // eslint-disable-line no-underscore-dangle
  const sorted = R.sortBy(typeOrderIndex, tools.filter(layersContainLayer));

  return sorted.reduce((acc, tool) => {
    const previousTool = acc[acc.length - 1];

    if (previousTool && previousTool.type !== tool.type) {
      return [
        ...acc,
        { type: 'separator' },
        tool,
      ];
    }

    return [
      ...acc,
      tool,
    ];
  }, []);
}

export default function ToolBox(props: Props) {
  const { tabDispatch, activeLayer } = props;

  const allowedTools = buildToolListForLayer(allTools, activeLayer);

  return (
    <div className="MapEditor__OverlayBox ToolBox">
      {allowedTools.map((tool) => tool.type === 'separator' ? <div className="ToolBox__separator" /> : (
        <button
          className={classNames({ active: props.selectedTool.id === tool.id })}
          onClick={() => handleToolClick(tool, tabDispatch)}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
