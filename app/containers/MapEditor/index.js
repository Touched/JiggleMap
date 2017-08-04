/*
 *
 * MapEditor
 *
 */

import React from 'react';

import Container from './Container';
import Content from './Content';

export class MapEditor extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <Container>
        <Content />
      </Container>
    );
  }
}

export default MapEditor;
