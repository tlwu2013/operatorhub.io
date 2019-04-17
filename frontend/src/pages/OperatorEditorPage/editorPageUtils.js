import * as React from 'react';
import * as _ from 'lodash-es';
import classNames from 'classnames';

import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators
} from '../../utils/operatorDescriptors';
import { getFieldValueError } from '../../utils/operatorUtils';
import EditorSelect from '../../components/editor/EditorSelect';

const EDITOR_STATUS = {
  empty: 'empty',
  pending: 'pending',
  complete: 'complete',
  errors: 'errors'
};

const renderFormError = (field, formErrors) => {
  const error = _.get(formErrors, field);
  if (!error) {
    return null;
  }
  return <div className="oh-operator-editor-form__error-block">{error}</div>;
};

const renderOperatorFormField = (
  operator,
  formErrors,
  updateOperator,
  commitField,
  title,
  field,
  fieldType,
  options
) => {
  const formFieldClasses = classNames({
    'oh-operator-editor-form__field': true,
    row: true,
    'oh-operator-editor-form__field--error': _.get(formErrors, field)
  });
  let inputComponent;

  if (fieldType === 'select' || fieldType === 'multi-select') {
    const fieldValue = _.get(operator, field);
    let values;
    if (fieldType === 'select') {
      values = [fieldValue];
    } else {
      values = _.isString(fieldValue) ? _.split(fieldValue, ',') : fieldValue;
    }

    inputComponent = (
      <EditorSelect
        id={_.camelCase(field)}
        values={values}
        options={options}
        isMulti={fieldType === 'multi-select'}
        placeholder={_.get(operator, field, `Select a ${title}`)}
        onChange={selections => {
          console.dir(selections);
          updateOperator(_.join(selections, ', '), field);
        }}
        onBlur={() => commitField(field)}
      />
    );
  } else if (fieldType === 'text-area') {
    inputComponent = (
      <textarea
        id={field}
        className="form-control"
        rows={_.isNumber(options) ? options : 3}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  } else {
    inputComponent = (
      <input
        id={field}
        className="form-control"
        type={fieldType}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  }

  return (
    <div className={formFieldClasses}>
      <div className="form-group col-sm-6">
        <label htmlFor={field}>{title}</label>
        {inputComponent}
        {renderFormError(field, formErrors)}
      </div>
      <div className="oh-operator-editor-form__description col-sm-6">{_.get(operatorFieldDescriptions, field, '')}</div>
    </div>
  );
};

const renderObjectFormField = (
  formObject,
  objectField,
  formErrors,
  updateObject,
  commitField,
  title,
  field,
  fieldType,
  options,
  inputRefCallback
) => {
  const formFieldClasses = classNames({
    'oh-operator-editor-form__field': true,
    row: true,
    'oh-operator-editor-form__field--error': _.get(formErrors, field)
  });
  let inputComponent;

  if (fieldType === 'select' || fieldType === 'multi-select') {
    const fieldValue = _.get(formObject, objectField);
    let values;
    if (fieldType === 'select') {
      values = [fieldValue];
    } else {
      values = _.isString(fieldValue) ? _.split(fieldValue, ',') : fieldValue;
    }

    inputComponent = (
      <EditorSelect
        id={_.camelCase(field)}
        values={values}
        options={options}
        isMulti={fieldType === 'multi-select'}
        placeholder={_.get(formObject, objectField, `Select a ${title}`)}
        onChange={selections => {
          console.dir(selections);
          updateObject(_.join(selections, ', '), objectField);
        }}
        onBlur={() => commitField(field)}
      />
    );
  } else if (fieldType === 'text-area') {
    inputComponent = (
      <textarea
        id={field}
        className="form-control"
        rows={_.isNumber(options) ? options : 3}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateObject(e.target.value, field)}
        onBlur={() => commitField(objectField)}
        value={_.get(formObject, objectField, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
        ref={inputRefCallback}
      />
    );
  } else {
    inputComponent = (
      <input
        id={field}
        className="form-control"
        type={fieldType}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateObject(e.target.value, objectField)}
        onBlur={() => commitField(objectField)}
        value={_.get(formObject, objectField, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
        ref={inputRefCallback}
      />
    );
  }

  return (
    <div className={formFieldClasses}>
      <div className="form-group col-sm-6">
        <label htmlFor={field}>{title}</label>
        {inputComponent}
        {renderFormError(field, formErrors)}
      </div>
      <div className="oh-operator-editor-form__description col-sm-6">{_.get(operatorFieldDescriptions, field, '')}</div>
    </div>
  );
};

const updateStoredOperator = (operator, value, field, storeEditorOperator) => {
  const updatedOperator = _.cloneDeep(operator);
  _.set(updatedOperator, field, value);
  storeEditorOperator(updatedOperator);
};

const updateStoredFormErrors = (operator, formErrors, fields, storeEditorFormErrors, sectionStatus) => {
  const fieldsArray = _.castArray(fields);
  const updatedFormErrors = _.clone(formErrors);
  _.forEach(fieldsArray, field => {
    const error = getFieldValueError(operator, field, sectionStatus);
    _.set(updatedFormErrors, field, error);
  });
  storeEditorFormErrors(updatedFormErrors);

  return updatedFormErrors;
};

export {
  renderOperatorFormField,
  renderObjectFormField,
  renderFormError,
  EDITOR_STATUS,
  updateStoredOperator,
  updateStoredFormErrors
};
