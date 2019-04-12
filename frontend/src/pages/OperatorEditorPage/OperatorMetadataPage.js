import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { categoryOptions } from '../../utils/operatorDescriptors';
import CapabilityEditor from '../../components/editor/CapabilityEditor';
import LabelsEditor from '../../components/editor/LabelsEditor';
import ImageEditor from '../../components/editor/ImageEditor';
import { renderOperatorFormField, updateStoredFormErrors, EDITOR_STATUS } from './editorPageUtils';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import DescriptionEditor from '../../components/editor/DescriptionEditor';

const METADATA_FIELDS = [
  'spec.displayName',
  'metadata.annotations.description',
  'spec.description',
  'spec.maturity',
  'spec.version',
  'spec.replaces',
  'spec.MinKubeVersion',
  'metadata.annotations.capabilities',
  'spec.installModes',
  'spec.labels',
  'spec.selector.matchLabels',
  'metadata.annotations.categories',
  'spec.keywords',
  'spec.icon'
];

const metadataDescription = `
  The metadata section contains general metadata around the name, version, and other info that aids users in the
  discovery of your Operator.
  `;

class OperatorMetadataPage extends React.Component {
  state = {
    workingOperator: {}
  };

  constructor(props) {
    super(props);

    this.state = { workingOperator: _.cloneDeep(props.operator) };
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;

    if (!_.isEqual(operator, prevProps.operator)) {
      this.setState({ workingOperator: _.cloneDeep(operator) });
    }
  }

  componentDidMount() {
    const { operator, sectionStatus, formErrors, storeEditorFormErrors } = this.props;
    this.originalOperator = _.cloneDeep(operator);
    this.originalStatus = sectionStatus.metadata;
    updateStoredFormErrors(operator, formErrors, METADATA_FIELDS, storeEditorFormErrors, sectionStatus.metadata);
  }

  componentWillUnmount() {
    const { operator, sectionStatus, setSectionStatus } = this.props;

    if (_.isEqual(operator, this.originalOperator)) {
      if (sectionStatus.metadata !== EDITOR_STATUS.complete) {
        if (!this.originalStatus || this.originalStatus === EDITOR_STATUS.empty) {
          setSectionStatus(this.originalStatus);
        }
      }
    }
    this.originalOperator = null;
  }

  operatorUpdated = () => {
    const { operator, storeEditorOperator } = this.props;
    storeEditorOperator(operator);
  };

  updateOperator = (value, field) => {
    const { workingOperator } = this.state;
    _.set(workingOperator, field, value);
    this.forceUpdate();
  };

  validateField = field => {
    const { storeEditorOperator, formErrors, storeEditorFormErrors, setSectionStatus } = this.props;
    const { workingOperator } = this.state;


    const errors = updateStoredFormErrors(workingOperator, formErrors, field, storeEditorFormErrors);
    const metadataErrors = _.some(METADATA_FIELDS, metadataField => _.get(errors, metadataField));

    storeEditorOperator(_.cloneDeep(workingOperator));

    if (metadataErrors) {
      setSectionStatus(EDITOR_STATUS.errors);
    } else {
      setSectionStatus(EDITOR_STATUS.pending);
    }
  };

  updateOperatorCapability = capability => {
    this.updateOperator(capability, 'metadata.annotations.capabilities');
    this.validateField('metadata.annotations.capabilities');
  };

  updateOperatorLabels = operatorLabels => {
    const labels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) && !_.isEmpty(operatorLabel.value)) {
        _.set(labels, operatorLabel.key, operatorLabel.value);
      }
    });
    this.updateOperator(labels, 'spec.labels');
    this.validateField('spec.labels');
  };

  updateOperatorSelectors = operatorLabels => {
    const matchLabels = {};

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.key) && !_.isEmpty(operatorLabel.value)) {
        _.set(matchLabels, operatorLabel.key, operatorLabel.value);
      }
    });
    this.updateOperator(matchLabels, 'spec.selector.matchLabels');
    this.validateField('spec.selector.matchLabels');
  };

  updateOperatorExternalLinks = operatorLabels => {
    const links = [];

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.url)) {
        links.push(_.clone(operatorLabel));
      }
    });

    this.updateOperator(links, 'spec.links');
    this.validateField('spec.links');
  };

  updateOperatorMaintainers = operatorLabels => {
    const maintainers = [];

    _.forEach(operatorLabels, operatorLabel => {
      if (!_.isEmpty(operatorLabel.name) && !_.isEmpty(operatorLabel.email)) {
        maintainers.push(_.clone(operatorLabel));
      }
    });

    this.updateOperator(maintainers, 'spec.maintainers');
    this.validateField('spec.maintainers');
  };

  renderFormField = (title, field, fieldType, options) => {
    const { operator, formErrors } = this.props;
    const { workingOperator } = this.state;

    const errs = this.originalStatus === EDITOR_STATUS.empty && _.get(operator, field) === undefined ? {} : formErrors;

    return renderOperatorFormField(
      workingOperator,
      errs,
      this.updateOperator,
      this.validateField,
      title,
      field,
      fieldType,
      options
    );
  };

  renderMetadataFields = () => {
    const { workingOperator } = this.state;
    return (
      <form className="oh-operator-editor-form">
        {this.renderFormField('Display Name', 'spec.displayName', 'text')}
        {this.renderFormField('Short Description', 'metadata.annotations.description', 'text-area')}
        {this.renderFormField('Maturity', 'spec.maturity', 'text')}
        {this.renderFormField('Version', 'spec.version', 'text')}
        {this.renderFormField('Replaces (optional)', 'spec.replaces', 'text')}
        {this.renderFormField('Minimum Kubernetes Version (optional)', 'spec.MinKubeVersion', 'text')}
        {this.renderFormField('Long Description', 'spec.description', 'text-area', 5)}
        <DescriptionEditor operator={workingOperator} onUpdate={this.updateOperator} />
        <CapabilityEditor operator={workingOperator} onUpdate={this.updateOperatorCapability} />
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorLabels}
          title="Labels (optional)"
          singular="Label"
          field="spec.labels"
        />
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorSelectors}
          title="Selectors (optional)"
          singular="Selector"
          field="spec.selector.matchLabels"
        />
        <h3>Categories and Keywords</h3>
        {this.renderFormField('Categories', 'metadata.annotations.categories', 'multi-select', categoryOptions)}
        {this.renderFormField('Keywords', 'spec.keywords', 'text')}
        <h3>Image Assets</h3>
        <ImageEditor onUpdate={this.operatorUpdated} operator={workingOperator} />
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorExternalLinks}
          title="External Links"
          singular="External Link"
          field="spec.links"
          keyField="name"
          keyLabel="Name"
          keyPlaceholder="e.g. Blog"
          valueField="url"
          valueLabel="URL"
          valuePlaceholder="e.g. https://coreos.com/etcd"
        />
        <h3>Contact Information</h3>
        {this.renderFormField('Provider Name', 'spec.provider.name', 'text')}
        <LabelsEditor
          operator={workingOperator}
          onUpdate={this.updateOperatorMaintainers}
          title="Maintainers"
          singular="Maintainer"
          field="spec.maintainers"
          keyField="name"
          keyLabel="Name"
          keyPlaceholder="e.g. support"
          valueField="email"
          valueLabel="Email"
          valuePlaceholder="e.g. support@example.com"
        />
      </form>
    );
  };

  render() {
    const { history } = this.props;
    return (
      <OperatorEditorSubPage
        title="Operator Metadata"
        description={metadataDescription}
        secondary
        history={history}
        section="metadata"
      >
        {this.renderMetadataFields()}
      </OperatorEditorSubPage>
    );
  }
}

OperatorMetadataPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  sectionStatus: PropTypes.object,
  setSectionStatus: PropTypes.func,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorMetadataPage.defaultProps = {
  operator: {},
  formErrors: {},
  sectionStatus: {},
  setSectionStatus: helpers.noop,
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    }),
  storeEditorFormErrors: formErrors =>
    dispatch({
      type: reduxConstants.SET_EDITOR_FORM_ERRORS,
      formErrors
    }),
  setSectionStatus: status =>
    dispatch({
      type: reduxConstants.SET_EDITOR_SECTION_STATUS,
      section: 'metadata',
      status
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorMetadataPage);
