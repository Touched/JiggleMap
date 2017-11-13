import React from 'react';
import { Button, Tooltip, Intent, Position } from '@blueprintjs/core';

type Props = {
  onToggleLayer: (string) => void,
  onRecenterClick: () => void,
  onZoomChanged: (number) => void,
  zoom: number;
  zoomMin: number;
  zoomMax: number;
  activeLayer: string
};

const LAYERS = [{
  id: 'map',
  icon: 'path-search',
  name: 'Map',
}, {
  id: 'height',
  icon: 'trending-up',
  name: 'Height',
}, {
  id: 'collision',
  icon: 'walk',
  name: 'Collision',
}, {
  id: 'entities',
  icon: 'lightbulb',
  name: 'Entities',
}];

export default function MapControls(props: Props) {
  const { onToggleLayer, onRecenterClick, onZoomChanged, zoom, zoomMin, zoomMax, activeLayer } = props;

  return (
    <div className="MapEditor__OverlayBox MapControls">
      <div className="MapControls__LayerControls pt-button-group">
        {LAYERS.map((layer) => (
          <Tooltip key={layer.id} content={layer.name} position={Position.TOP}>
            <Button
              intent={activeLayer === layer.id ? Intent.PRIMARY : Intent.NONE}
              onClick={() => onToggleLayer(layer.id)}
              iconName={layer.icon}
            />
          </Tooltip>
        ))}
      </div>
      <div className="MapControls__box">
        <div className="MapControls__CameraControls">
          <div className="pt-button-group pt-vertical">
            <Tooltip content={'Recenter'} position={Position.LEFT}>
              <Button
                onClick={onRecenterClick}
                iconName="locate"
              />
            </Tooltip>
            <Tooltip content={'Reset Zoom'} position={Position.LEFT}>
              <Button
                onClick={() => onZoomChanged(1)}
                iconName="zoom-to-fit"
              />
            </Tooltip>
            <Tooltip content={'Zoom Out'} position={Position.LEFT}>
              <Button
                onClick={() => onZoomChanged(Math.max(zoomMin, zoom - 0.1))}
                iconName="zoom-out"
              />
            </Tooltip>
            <Tooltip content={'Zoom In'} position={Position.LEFT}>
              <Button
                onClick={() => onZoomChanged(Math.min(zoomMax, zoom + 0.1))}
                iconName="zoom-in"
              />
            </Tooltip>
          </div>
        </div>
        <div className="MapControls__MiniMap" />
      </div>
    </div>
  );
}
