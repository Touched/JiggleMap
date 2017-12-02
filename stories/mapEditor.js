import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ToolBox from 'containers/MapEditor/ToolBox';
import MapControls from 'containers/MapEditor/MapControls';
import buildPropertiesEditor, {
  Panel,
  Section,
  Row,
  NumericField,
  MonospaceField,
  TextAreaField,
  SwitchField,
  FileField,
  SelectConstantField,
  Field,
} from 'containers/MapEditor/Properties';

import { SpritePickerField, SpritePicker } from 'containers/MapEditor/Properties/SpritePickerField';

import { reducer as formReducer } from 'redux-form';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

import 'sanitize.css/sanitize.css';
import '@blueprintjs/core/dist/blueprint.css';

import overworldSpriteList from './data/sprite-sheet.json';
import overworldSpriteSheet from './data/sprite-sheet.png';

const MarginDecorator = (storyFn) => (
  <div style={{ margin: 10 }}>
    {storyFn()}
  </div>
);

const store = createStore(combineReducers({ form: formReducer }), {});

const ProviderDecorator = (storyFn) => (
  <Provider store={store}>
    {storyFn()}
  </Provider>
);

storiesOf('MapEditor ToolBox', module)
  .addDecorator(MarginDecorator)
  .add('map layer', () => (
    <ToolBox
      activeLayer="map"
      selectedTool={{ id: 'pointer-tool' }}
      tabDispatch={action('dispatch')}
    />
  ));

storiesOf('MapEditor MapControls', module)
  .addDecorator(MarginDecorator)
  .add('without minimap', () => (
    <MapControls
      onToggleLayer={action('toggleLayer')}
      onRecenterClick={action('recenter')}
      onZoomChanged={action('zoomChanged')}
      zoom={1}
      zoomMin={0.25}
      zoomMax={4}
      activeLayer={'height'}
    />
  ));

const takenIdentifiers = ['object-2'];

const entity = {
  id: 'object-3',
  x: 10,
  y: 8,
  z: 3,
  data: {
    sprite: 71,
    replacement: 0, // "rival" -> Copies an NPC from another map
    behavior: 7,
    boundary: {
      x: 1, // 0-15
      y: 1, // 0-15
    },
    isTrainer: false,
    viewRadius: 0,
    script: {
      symbol: 'palletTownObject2Main',
      path: 'scripts/object/2.s',
    },
    flag: 'MY_FLAG',
  },
};

// // TODO: Find some way to pass props into validators
const idValidators = [
  (value) => value && !/^[a-z0-9-]+$/.test(value) ?
    'Identifier must consist only of lowercase letters, numbers and dashes.' : undefined,
  (value) => value && !/^(?!-)((?!-$)[a-z0-9-])+$/.test(value) ?
    'Identifier cannot start or end with a dash.' : undefined,
  (value) => value && !/^((?!-{2,})[a-z0-9-])+$/.test(value) ?
    'Identifier cannot contain more than one consecutive dash.' : undefined,
  (value) => value && /^[0-9]/.test(value) ?
    'Identifier must start with a lowercase letter.' : undefined,
  (value) => takenIdentifiers.indexOf(value) >= 0 ?
    'Identifier must be unique.' : undefined,
];

const symbolsList = [
  { id: 'someReallyLongName0' },
  { id: 'palletTownObject2Main' },
];

// TODO: Sprite, behavior, flag
const EntityProperties = buildPropertiesEditor('form')(({ values }) => (
  <Panel title="Object">
    <Section name="General">
      <Row label="ID" help="A unique identifier for this object." documentation="test">
        <Field
          name="id"
          component={MonospaceField}
          validate={idValidators}
        />
      </Row>
      <Row label="Coordinates" help="The position of the object." documentation="test">
        <Field
          name="x"
          component={NumericField}
          leftIconName="x-variable"
        />
        <Field
          name="y"
          component={NumericField}
          leftIconName="y-variable"
        />
        <Field
          name="z"
          component={NumericField}
          leftIconName="z-variable"
        />
      </Row>
    </Section>
    <Section name="Behavior">
      <Row label="Boundary" help="The bounding box of the object." documentation="test">
        <Field
          name="data.boundary.x"
          component={NumericField}
          leftIconName="arrows-horizontal"
        />
        <Field
          name="data.boundary.y"
          component={NumericField}
          leftIconName="arrows-vertical"
        />
      </Row>
      <Field
        name="data.isTrainer"
        component={SwitchField}
        label="Trainer"
      />
      <Row label="View Radius" help="The number of squares the trainer can see." visible={values.data.isTrainer}>
        <Field
          name="data.viewRadius"
          component={NumericField}
          min={0}
        />
      </Row>
    </Section>

    <Section name="Script">
      <Row label="File">
        <Field
          name="data.script.path"
          component={FileField}
        />
      </Row>
      <Row label="Entry Point" help="The name of the entry point symbol." documentation="Scripting#entry_point">
        <Field
          name="data.script.symbol"
          component={SelectConstantField}
          list={symbolsList}
        />
      </Row>
    </Section>

    <Section name="Other">
      <Row label="Notes" help="These notes will be saved with your project.">
        <Field
          name="notes"
          component={TextAreaField}
          placeholder="Keep your notes here."
        />
      </Row>
    </Section>
  </Panel>
));

storiesOf('MapEditor Properties', module)
  .addDecorator(MarginDecorator)
  .addDecorator(ProviderDecorator)
  .add('with entity fields', () => (
    <EntityProperties onSubmit={action('update')} initialValues={entity} />
  ));

const categories = [
  {
    id: 'people',
    name: 'People',
  },
  {
    id: 'pokemon',
    name: 'Pokémon',
  },
  {
    id: 'berry-trees',
    name: 'Berry Trees',
  },
  {
    id: 'dolls',
    name: 'Dolls',
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
  },
  {
    id: 'cushions',
    name: 'Cushions',
  },
];

storiesOf('MapEditor SpritePicker', module)
  .addDecorator(MarginDecorator)
  .add('inline', () => (
    <SpritePicker
      sheet={overworldSpriteSheet}
      sprites={overworldSpriteList}
      categories={categories}
      onChange={action('pick')}
    />
  ))
  .add('field', () => (
    <SpritePickerField
      sheet={overworldSpriteSheet}
      sprites={overworldSpriteList}
      categories={categories}
      onChange={action('pick')}
      value={overworldSpriteList.find(({ id }) => id === 'ss-tidal')}
    />
  ));
