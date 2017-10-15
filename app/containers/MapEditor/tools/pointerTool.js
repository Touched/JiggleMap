import React from 'react';
import CursorDefaultOutlineIcon from 'mdi-react/CursorDefaultOutlineIcon';
import invariant from 'invariant';

import createMouseTool from './createMouseTool';

function ObjectEntityForm({ id, x, y }: { id: string, x: number, y: number }) {
  return (
    <form>
      <div>
        Identifier
        <input value={id} />
      </div>
      <div>
        x
        <input value={x} type="number" />
        y
        <input value={y} type="number" />
      </div>
    </form>
  );
}

function NoForm() {
  return <div>NoForm</div>;
}

const entityForms = {
  object: ObjectEntityForm,
  warp: NoForm,
  interactable: NoForm,
  tirgger: NoForm,
};

export default createMouseTool({
  id: 'pointer-tool',
  name: 'Pointer',
  description: 'Edit the properties of maps, connections and entities',
  layers: ['map', 'entities'],
  icon: <CursorDefaultOutlineIcon />,
  component: ({ state }: { state: Object }) => {
    const { object } = state.mouse;
    if (object) {
      if (object.type === 'entity') {
        const Form = entityForms[object.data.type];

        invariant(Form, `There is no form configured that can handle an entity of type ${object.data.type}`);

        const { id, x, y, z } = object.data;
        return React.createElement(Form, { data: object.data.data, x, y, z, id });
      }
    }

    return <div>Nothing</div>;
  },
  onMousePress() {},
  onMouse() {},
  onMouseRelease() {},
  handlesType(type) {
    return ['entity', 'connected-map', 'main-map'].indexOf(type) !== -1;
  },
  getCursorForObject() {
    return 'pointer';
  },
});
