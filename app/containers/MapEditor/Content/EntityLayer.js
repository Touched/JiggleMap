import React from 'react';
import { createStructuredSelector } from 'reselect';

import { Group } from 'components/Renderer';
import connectTab from 'containers/EditorTabs/connectTab';
import { makeSelectMainMapEntities, makeSelectActiveLayer } from '../selectors';
import { moveEntity, commitEntityMove } from '../actions';

import Entity from './Entity';
import type { EntityType } from './Entity';

export class EntityLayer extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    entities: Array<EntityType>;
    moveEntity: Function;
    commitEntityMove: Function;
    activeLayer: string;
  };

  render() {
    return (
      <Group>
        {this.props.activeLayer === 'entities' && this.props.entities.map((entity) => (
          <Entity
            key={entity.id}
            entity={entity}
            onDrag={(start, end) => this.props.moveEntity(entity.id, end.x - start.x, end.y - start.y)}
            onDragEnd={() => this.props.commitEntityMove(entity.id)}
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

function mapTabDispatchToProps(tabDispatch) {
  return {
    moveEntity(id, x, y) {
      tabDispatch(moveEntity(id, x, y));
    },
    commitEntityMove(id) {
      tabDispatch(commitEntityMove(id));
    },
  };
}

export default connectTab(null, mapTabStateToProps, null, mapTabDispatchToProps)(EntityLayer);
