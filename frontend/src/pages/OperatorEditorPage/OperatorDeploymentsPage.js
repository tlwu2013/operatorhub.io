import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { getFieldValueError } from '../../utils/operatorUtils';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import ListObjectEditor from '../../components/editor/ListObjectEditor';

const OperatorDeploymentsPage = ({ operator, formErrors, storeEditorOperator, storeEditorFormErrors, history }) => {
  const updateOperator = deployments => {
    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, 'spec.install.spec.deployments', deployments);
    storeEditorOperator(updatedOperator);
    validateField('spec.install.spec.deployments');
  };

  const validateField = field => {
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  return (
    <OperatorEditorSubPage
      title="Deployments"
      field="spec.install.spec.deployments"
      secondary
      history={history}
      section="deployments"
    >
      <ListObjectEditor
        operator={operator}
        title="Deployments"
        onUpdate={updateOperator}
        field="spec.install.spec.deployments"
        fieldTitle="Name"
        objectPage="deployments"
        history={history}
        objectTitleField="name"
        objectType="Deployment"
      />
    </OperatorEditorSubPage>
  );
};

OperatorDeploymentsPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorDeploymentsPage.defaultProps = {
  operator: {},
  formErrors: {},
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
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorDeploymentsPage);
