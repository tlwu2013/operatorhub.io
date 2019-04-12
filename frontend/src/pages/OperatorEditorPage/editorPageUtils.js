import * as React from 'react';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import Select from 'react-select';

import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators
} from '../../utils/operatorDescriptors';
import { getFieldValueError } from '../../utils/operatorUtils';

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
    let value;
    if (fieldType === 'select') {
      value = _.find(options, { value: fieldValue });
    } else {
      const fieldValues = _.isString(fieldValue) ? _.split(fieldValue, ',') : fieldValue;
      value = _.filter(options, option => _.find(fieldValues, nextValue => nextValue.trim() === option.value));
    }

    inputComponent = (
      <Select
        className="oh-operator-editor-form__select"
        value={value}
        placeholder={_.get(operator, field, `Select a ${title}`)}
        id={_.camelCase(field)}
        isMulti={fieldType === 'multi-select'}
        options={options}
        isSearchable={false}
        styles={{
          control: base => ({
            ...base,
            '&:hover': { borderColor: '#eaeaea' },
            border: '1px solid #eaeaea',
            boxShadow: 'none'
          })
        }}
        onChange={option => {
          const values = _.reduce(
            option,
            (selections, selection) => {
              selections.push(selection.value);
              return selections;
            },
            []
          );

          updateOperator(_.join(values, ', '), field);
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
    let value;
    if (fieldType === 'select') {
      value = _.find(options, { value: fieldValue });
    } else {
      const fieldValues = _.isString(fieldValue) ? _.split(fieldValue, ',') : fieldValue;
      value = _.filter(options, option => _.find(fieldValues, nextValue => nextValue.trim() === option.value));
    }

    inputComponent = (
      <Select
        className="oh-operator-editor-form__select"
        value={value}
        placeholder={_.get(formObject, objectField, `Select a ${title}`)}
        id={_.camelCase(field)}
        isMulti={fieldType === 'multi-select'}
        options={options}
        isSearchable={false}
        ref={inputRefCallback}
        styles={{
          control: base => ({
            ...base,
            '&:hover': { borderColor: '#eaeaea' },
            border: '1px solid #eaeaea',
            boxShadow: 'none'
          })
        }}
        onChange={option => {
          const values = _.reduce(
            option,
            (selections, selection) => {
              selections.push(selection.value);
              return selections;
            },
            []
          );

          updateObject(_.join(values, ', '), objectField);
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

export { renderOperatorFormField, renderObjectFormField, EDITOR_STATUS, updateStoredOperator, updateStoredFormErrors };