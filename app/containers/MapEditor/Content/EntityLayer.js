import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';
import { makeSelectMainMapEntities } from '../selectors/mapSelectors';
import { makeSelectActiveLayer } from '../selectors/editingSelectors';

import Entity from './Entity';
import type { EntityType } from './Entity';

export class EntityLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    entities: Array<EntityType>;
    activeLayer: string;
  };

  render() {
    return (
      <Group>
        {this.props.activeLayer === 'entities' && this.props.entities.map((entity, index) => (
          <Entity
            key={entity.id}
            entity={{ ...entity, index }}
          />
        ))}
      </Group>
    );
  }
}

const mapTabStateToProps = createStructuredSelector({
  entities: makeSelectMainMapEntities(),
  activeLayer: makeSelectActiveLayer(),
});

export default connectTab(null, mapTabStateToProps, null, null)(EntityLayer);
