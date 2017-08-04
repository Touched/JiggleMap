import React from 'react';

import { Group } from 'components/Renderer';

import EntityLayer from './EntityLayer';
import MainMapLayer from './MainMapLayer';
import ConnectedMapsLayer from './ConnectedMapsLayer';

export default function Content() {
  return (
    <Group>
      <ConnectedMapsLayer />
      <MainMapLayer />
      <EntityLayer />
    </Group>
  );
}
