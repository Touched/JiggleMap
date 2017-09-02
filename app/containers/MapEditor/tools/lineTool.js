/* @flow */

import React from 'react';
import VectorLineIcon from 'mdi-react/VectorLineIcon';

import messages from './messages';
import buildTool from './buildTool';

export default buildTool({
  id: 'line-tool',
  name: messages.lineToolName,
  description: messages.lineToolDescription,
  layers: ['map'],
  icon: <VectorLineIcon />,
});
