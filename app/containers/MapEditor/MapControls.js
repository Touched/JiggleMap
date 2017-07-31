import React from 'react';
import classNames from 'classnames';
import MapIcon from 'mdi-react/MapIcon';
import ImageFilterHdrIcon from 'mdi-react/ImageFilterHdrIcon';
import ArrowCompressIcon from 'mdi-react/ArrowCompressIcon';
import NaturePeopleIcon from 'mdi-react/NaturePeopleIcon';
import ImageFilterCenterFocusIcon from 'mdi-react/ImageFilterCenterFocusIcon';

type Props = {
  onToggleLayer: (string) => void,
  onRecenterClick: () => void,
  onZoomChanged: (number) => void,
  zoom: number;
  zoomMin: number;
  zoomMax: number;
  selectedLayer: string
};

const LAYERS = [{
  id: 'map',
  icon: <MapIcon />,
}, {
  id: 'height',
  icon: <ImageFilterHdrIcon />,
}, {
  id: 'collision',
  icon: <ArrowCompressIcon />,
}, {
  id: 'entities',
  icon: <NaturePeopleIcon />,
}];

export default function MapControls(props: Props) {
  const { onToggleLayer, onRecenterClick, onZoomChanged, zoom, zoomMin, zoomMax, selectedLayer } = props;

  return (
    <div className="MapEditor__OverlayBox MapControls">
      <div className="MapControls__LayerControls">
        {LAYERS.map((layer) => (
          <button
            className={classNames({ active: selectedLayer === layer.id })}
            onClick={() => onToggleLayer(layer.id)}
          >
            {layer.icon}
          </button>
        ))}
      </div>
      <div className="MapControls__CameraControls">
        <input type="range" onChange={onZoomChanged} min={zoomMin} max={zoomMax} value={zoom} step={0.01} />
        <button onClick={onRecenterClick}><ImageFilterCenterFocusIcon /></button>
      </div>
    </div>
  );
}
