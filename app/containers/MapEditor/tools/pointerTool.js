import React from 'react';
import CursorDefaultOutlineIcon from 'mdi-react/CursorDefaultOutlineIcon';
import invariant from 'invariant';
import { Field, reduxForm } from 'redux-form';

import { modifyEntityProps } from '../actions';

import createMouseTool from './createMouseTool';

function ObjectEntityForm({ handleSubmit }: { handleSubmit: Function }) {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        Identifier
        <Field name="id" component="input" type="text" />
      </div>
      <div>
        x
        <Field name="x" component="input" type="number" min={0} />
        y
        <Field name="y" component="input" type="number" min={0} />
      </div>
    </form>
  );
}

function NoForm() {
  return <div>NoForm</div>;
}

const entityForms = {
  object: reduxForm({ form: 'object-entity' })(ObjectEntityForm),
  warp: NoForm,
  interactable: NoForm,
  trigger: NoForm,
};

export default createMouseTool({
  id: 'pointer-tool',
  name: 'Pointer',
  description: 'Edit the properties of maps, connections and entities',
  layers: ['map', 'entities'],
  icon: <CursorDefaultOutlineIcon />,
  component: ({ state, tabDispatch }: { state: Object, tabDispatch: Function }) => {
    const { object } = state.mouse;

    if (object) {
      if (object.type === 'entity') {
        const Form = entityForms[object.data.type];

        invariant(Form, `There is no form configured that can handle an entity of type ${object.data.type}`);

        const { index, id, x, y, z } = object.data;
        const data = { data: object.data.data, x, y, z, id };

        return React.createElement(Form, {
          initialValues: data,
          onChange: (values, dispatch, { submit }) => submit(),

          // Use the entity index as an identifier so that the 'id' property can
          // still be edited without breaking the updating. If the entities are
          // to be reordered, there can be a separate 'order' property.
          onSubmit: (values) => {
            // FIXME: Convert entity props to correct types (instead of all strings)
            tabDispatch(modifyEntityProps(index, values));
          },
          key: index,
        });
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
