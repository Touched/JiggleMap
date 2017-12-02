import * as React from 'react';
import R from 'ramda';
import { Button, Classes, NumericInput, MenuItem } from '@blueprintjs/core';
import { Select } from '@blueprintjs/labs';
import { reduxForm, getFormValues } from 'redux-form';
import fuzzy from 'fuzzy';
import classNames from 'classnames';
import debounce from 'debounce';
import { connect } from 'react-redux';
import { renameProp, withProps, pure, compose, shouldUpdate } from 'recompose';
import ReactJson from 'react-json-view';

import styles from './styles.scss';

// Wrap a normal input component so that it is compatible with the redux-form API
function wrapInput(Component) {
  return function Input({ input, meta, ...props }: { input: object, meta: object, className: string }) { // eslint-disable-line no-unused-vars
    return (
      <Component
        {...input}
        {...props}
        className={classNames(props.className, { 'pt-intent-danger': meta.error })}
      />
    );
  };
}

const renderConstant = ({ handleClick, item, isActive }: { handleClick: Function, item: object, isActive: bool }) => (
  <MenuItem
    className={classNames({ [Classes.ACTIVE]: isActive })}
    key={item.id}
    onClick={handleClick}
    label={item.name}
    text={<span className="pt-monospace-text">{item.id}</span>}
  />
);

export function SelectConstantField({ input, list, actionIconName, onActionClick }: { input: object, list: Array, actionIconName: ?string, onActionClick: ?Function }) {
  function handleAction(event) {
    event.stopPropagation();
    onActionClick(event);
  }

  return (
    <Select
      resetOnClose
      resetOnSelect
      items={list}
      itemRenderer={renderConstant}
      onItemSelect={(item) => input.onChange(item.id)}
      noResults={<MenuItem disabled text="No results." />}
      className="pt-fill"
      style={{ display: 'block' }}
      itemPredicate={(query, item) => fuzzy.match(query, item.id)}
    >
      <div className="pt-control-group">
        <Button
          className={classNames('pt-fill', 'pt-monospace-text', styles.selectionButton)}
          rightIconName="pt-icon-caret-down"
        >
          <div>{input.value}</div>
        </Button>
        {onActionClick && <Button iconName={actionIconName} onClick={handleAction} />}
      </div>
    </Select>
  );
}

export const MonospaceField = compose(
  withProps({
    className: 'pt-input pt-fill pt-monospace-text',
    dir: 'auto',
    type: 'text',
  }),
  wrapInput,
)('input');

export const NumericField = compose(
  withProps({
    className: 'pt-fill',
    dir: 'auto',
  }),
  wrapInput,
  renameProp('onChange', 'onValueChange'),
)(NumericInput);

export const TextAreaField = compose(
  wrapInput,
  withProps({ className: 'pt-input pt-fill', dir: 'auto' }),
)('textarea');

export const FileField = wrapInput((props) => (
  <label className="pt-file-upload pt-fill">
    <input {...props} type="filse" />
    <span className="pt-file-upload-input">{props.value || <span>Choose file&hellip;</span>}</span>
  </label>
));

export const SwitchField = ({ input, label }: { input: object, label: string }) => (
  <label className="pt-control pt-switch">
    <input type="checkbox" {...input} />
    <span className="pt-control-indicator"></span>
    {label}
  </label>
);

function SectionComponent({ name, children }: { name: string, children: React.Element }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeading}>{name}</div>
      {children}
    </div>
  );
}

export const Section = pure(SectionComponent);

export { default as Row } from './Row';
export { default as SpritePickerField } from './SpritePickerField';
export { Field } from 'redux-form';

class Panel extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      editCodeEnabled: false,
    };
  }

  props: {
    title: string,
    children: React.Element,
    handleSubmit: Function,
    values: Object,
  }

  handleEditCodeClicked = () => {
    this.setState((state) => ({
      editCodeEnabled: !state.editCodeEnabled,
    }));
  };

  render() {
    const { title, children } = this.props;

    const form = this.state.editCodeEnabled ? (
      <div className={styles.code}>
        <ReactJson src={this.props.values} />
      </div>
    ) : (
      <form className={styles.content} onSubmit={this.props.handleSubmit}>
        {children}
      </form>
    );

    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>{title}</div>
          <Button
            active={this.state.editCodeEnabled}
            iconName="code"
            className={classNames(styles.headerButton, Classes.MINIMAL)}
            onClick={this.handleEditCodeClicked}
          />
        </div>
        {form}
      </div>
    );
  }
}

export default function buildPropertiesEditor(id, title) {
  const selectValues = getFormValues(id);

  function mapStateToProps(state, ownProps) {
    return {
      values: selectValues(state) || ownProps.initialValues,
    };
  }

  const wrap = compose(
    reduxForm({
      form: id,
      onChange: debounce((values, dispatch, { submit }) => submit(), 200),
    }),
    connect(mapStateToProps),
    shouldUpdate((props, nextProps) => {
      if (!R.equals(props.values, nextProps.values)) {
        return true;
      }

      return false;
    })
  );

  return (Component) => wrap(({ values, ...props }) => (
    <Panel title={title} {...props} values={values}>
      <Component values={values} />
    </Panel>
  ));
}
