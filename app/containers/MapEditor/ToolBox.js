import React from 'react';
import { ActionCreators } from 'redux-undo';
import classNames from 'classnames';
import VectorLineIcon from 'mdi-react/VectorLineIcon';
import VectorRectangleIcon from 'mdi-react/VectorRectangleIcon';
import UndoIcon from 'mdi-react/UndoIcon';
import RedoIcon from 'mdi-react/RedoIcon';

type Props = {
  tabDispatch: ({ type: string }) => void,
  selectedTool: string
};

const TOOLS = [{
  id: 'line',
  type: 'toggle',
  icon: <VectorLineIcon />,
}, {
  id: 'rectangle',
  type: 'toggle',
  icon: <VectorRectangleIcon />,
}, {
  type: 'separator',
}, {
  id: 'undo',
  type: 'click',
  icon: <UndoIcon />,
  action: ActionCreators.undo,
}, {
  id: 'redo',
  type: 'click',
  icon: <RedoIcon />,
  action: ActionCreators.redo,
}];

export default function ToolBox(props: Props) {
  const { selectedTool, tabDispatch } = props;

  return (
    <div className="MapEditor__OverlayBox ToolBox">
      {TOOLS.map((layer) => layer.type === 'separator' ? <div className="ToolBox__separator" /> : (
        <button
          className={classNames({ active: selectedTool === layer.id })}
          onClick={() => layer.action && tabDispatch(layer.action())}
        >
          {layer.icon}
        </button>
      ))}
    </div>
  );
}
