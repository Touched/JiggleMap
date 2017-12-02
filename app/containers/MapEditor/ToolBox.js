import React from 'react';
import R from 'ramda';
import { Button, Classes, Intent, Tooltip, Position } from '@blueprintjs/core';
import classNames from 'classnames';

import allTools from './tools';
import { setActiveTool } from './actions';
import styles from './styles.scss';

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

export function getFirstAllowedToolIdForLayer(layer) {
  const firstToolForLayer = buildToolListForLayer(allTools, layer).filter((tool) => tool.type === 'mouse')[0];
  return firstToolForLayer && firstToolForLayer.id;
}

export default function ToolBox(props: Props) {
  const { tabDispatch, activeLayer } = props;

  const allowedTools = buildToolListForLayer(allTools, activeLayer);
  const activeToolId = props.selectedTool && props.selectedTool.id;

  return (
    <div className={classNames(styles.overlayBox, styles.toolBox, 'pt-button-group')}>
      {allowedTools.map((tool) => {
        const tooltip = (
          <div>
            <strong>{tool.name}</strong>
            <div>{tool.description}</div>
          </div>
        );

        return tool.type === 'separator' ? <div /> : (
          <Tooltip key={tool.id} content={tooltip} position={Position.BOTTOM}>
            <Button
              iconName={tool.icon}
              className={Classes.LARGE}
              intent={activeToolId === tool.id ? Intent.PRIMARY : Intent.NONE}
              onClick={() => handleToolClick(tool, tabDispatch)}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}

