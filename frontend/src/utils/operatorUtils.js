import * as _ from 'lodash-es';
import { operatorFieldValidators } from './operatorDescriptors';

const normalizeVersion = version => {
  let normVersion = version.replace(/-beta/gi, 'beta');
  normVersion = normVersion.replace(/-alpha/gi, 'alpha');

  return normVersion;
};

const validCapabilityStrings = ['Basic Install', 'Seamless Upgrades', 'Full Lifecycle', 'Deep Insights', 'Auto Pilot'];

const normalizeCapabilityLevel = capability => {
  if (validCapabilityStrings.includes(capability)) {
    return capability;
  }
  return validCapabilityStrings[0];
};

const getExampleYAML = (kind, operator) => {
  const examples = _.get(operator, 'metadata.annotations.alm-examples');
  if (!examples) {
    return null;
  }

  try {
    const yamlExamples = JSON.parse(examples);
    return _.find(yamlExamples, { kind });
  } catch (e) {
    throw new Error(`Unable to parse alm-examples. ${e.message}`);
  }
};

const normalizeCRD = (crd, operator) => ({
  name: _.get(crd, 'name', 'Name Not Available'),
  kind: crd.kind,
  displayName: _.get(crd, 'displayName', 'Name Not Available'),
  description: _.get(crd, 'description', 'No description available'),
  yamlExample: getExampleYAML(crd.kind, operator)
});

const normalizeCRDs = operator => {
  const customResourceDefinitions = _.get(operator, 'spec.customresourcedefinitions.owned');
  return _.map(customResourceDefinitions, crd => normalizeCRD(crd, operator));
};

const generateIdFromVersionedName = name => name.slice(0, name.indexOf('.'));

const isGlobalOperator = installModes => _.some(installModes, { type: 'AllNamespaces', supported: true });

const normalizeOperator = operator => {
  const annotations = _.get(operator, 'metadata.annotations', {});
  const spec = _.get(operator, 'spec', {});
  const iconObj = _.get(spec, 'icon[0]');
  const categoriesString = _.get(annotations, 'categories');
  const packageInfo = _.get(operator, 'packageInfo', {});

  return {
    id: generateIdFromVersionedName(operator.metadata.name),
    name: operator.metadata.name,
    displayName: _.get(spec, 'displayName', operator.metadata.name),
    imgUrl: iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : '',
    longDescription: _.get(spec, 'description', annotations.description),
    provider: _.get(spec, 'provider.name'),
    version: spec.version,
    versionForCompare: normalizeVersion(spec.version),
    capabilityLevel: normalizeCapabilityLevel(annotations.capabilities || ''),
    links: spec.links,
    repository: annotations.repository,
    maintainers: spec.maintainers,
    description: _.get(annotations, 'description'),
    categories: categoriesString && _.map(categoriesString.split(','), category => category.trim()),
    createdAt: annotations.createdAt && `${annotations.createdAt}`,
    containerImage: annotations.containerImage,
    customResourceDefinitions: normalizeCRDs(operator),
    packageName: packageInfo.packageName,
    channels: packageInfo.channels,
    globalOperator: isGlobalOperator(_.get(spec, 'installModes'))
  };
};

const urlRegExp = new RegExp(
  '^(?:(?:(?:https?|ftp):)?//)' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port
  '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
  'i'
);

const emailRegExp = new RegExp(
  "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|" +
    '"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")' +
    '@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?' +
    '|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.)' +
    '{3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:' +
    '[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])'
);

const getFieldValueError = (operator, field) => {
  const value = _.get(operator, field);

  const fieldRegex = _.get(_.get(operatorFieldValidators, field), 'regex');
  if (fieldRegex) {
    if (!fieldRegex.test(value)) {
      return _.get(_.get(operatorFieldValidators, field), 'regexErrorMessage');
    }
  }

  const validator = _.get(_.get(operatorFieldValidators, field), 'validator');
  if (validator) {
    return validator(value);
  }

  if (_.get(operatorFieldValidators, field, {}).required && _.isEmpty(value)) {
    return 'This field is required';
  }

  return null;
};

const validateOperatorSubFields = (operator, fieldList) => {
  const validators = _.get(operatorFieldValidators, fieldList);
  if (!_.isObject(validators)) {
    return true;
  }

  const error = _.find(_.keys(validators), key => {
    const newFieldList = _.clone(fieldList);
    newFieldList.push(key);
    const field = newFieldList.join('.');

    if (getFieldValueError(operator, field)) {
      return true;
    }

    return !validateOperatorSubFields(operator, newFieldList);
  });

  return !error;
};

const validateOperator = operator => {
  if (_.isEmpty(operator)) {
    return false;
  }

  const error = _.find(_.keys(operatorFieldValidators), key => {
    if (getFieldValueError(operator, key)) {
      return false;
    }

    return !validateOperatorSubFields(operator, [key]);
  });

  return !error;
};

const getFieldMissing = (operator, field) => {
  const value = _.get(operator, field, '');
  const required = _.get(_.get(operatorFieldValidators, field), 'required', false);
  return value === '' && required;
};

export {
  generateIdFromVersionedName,
  normalizeOperator,
  emailRegExp,
  urlRegExp,
  validCapabilityStrings,
  validateOperator,
  getFieldValueError,
  getFieldMissing
};
