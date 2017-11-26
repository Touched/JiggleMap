import { resolve } from 'url';
import * as React from 'react';
import R from 'ramda';
import { Icon, Tooltip } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { getFormSyncErrors } from 'redux-form';
import classNames from 'classnames';
import { createSelector } from 'reselect';

import styles from './styles.scss';

const DOCUMENTATION_BASE = 'https://github.com/Touched/JiggleMap/wiki/';

function DocumentationLink({ page }: { page: string }) {
  const url = resolve(DOCUMENTATION_BASE, page);

  return (
    <Tooltip content="Go to documentation">
      <a href={url} target="_blank">
        <Icon iconName="help" iconSize={10} />
      </a>
    </Tooltip>
  );
}

function HelperText({ error, help, documentation }: { error: ?string, help: ?string, documentation: ?string }) {
  if (error) {
    return (
      <div className="pt-form-helper-text">
        {error}
      </div>
    );
  }

  if (help) {
    return (
      <div className="pt-form-helper-text">
        {help} {documentation && <DocumentationLink page={documentation} />}
      </div>
    );
  }

  return null;
}

export class Row extends React.PureComponent {
  static defaultProps = {
    visible: true,
  };

  props: {
    label: string,
    children: React.Element,
    help: ?string,
    documentation: ?string,
    error: ?string,
    visible: bool,
  }

  render() {
    const { label, children, help, documentation, error, visible } = this.props;

    if (!visible) {
      return null;
    }

    const fields = React.Children.map(children, (child) => (
      <div className={styles.inlineControl}>{child}</div>
    ));

    const classes = classNames({
      'pt-intent-danger': error,
    });

    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <div className={classNames('pt-form-group', classes)}>
        <label className="pt-label">
          {label}
        </label>
        <div style={{ display: 'flex', flexDirection: 'row', margin: '0 -5px' }}>
          {fields}
        </div>
        <HelperText help={help} documentation={documentation} error={error} />
      </div>
    );
    /* eslint-enable */
  }
}

const getFieldNames = (state, props) =>
      R.pickAll(React.Children.map(props.children, R.path(['props', 'name'])));

const makeSelectError = () => createSelector(
  getFieldNames,
  getFormSyncErrors('form'), // TODO: Get form ID from context
  (fieldNames, errors) => {
    const selectedErrors = fieldNames(errors || {});

    // Only return the first error to ensure memoization works correctly
    return R.values(selectedErrors)[0];
  }
);

function makeMapStateToProps() {
  const selectError = makeSelectError();

  return (state, ownProps) => ({
    error: selectError(state, ownProps),
  });
}

export default connect(makeMapStateToProps)(Row);
