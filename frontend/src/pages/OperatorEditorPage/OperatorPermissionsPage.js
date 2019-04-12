import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import OperatorEditorSubPage from './OperatorEditorSubPage';

const OperatorPermissionsPage = ({ operator, formErrors, storeEditorOperator, storeEditorFormErrors, history }) => (
  <OperatorEditorSubPage
    title="Permissions"
    field="spec.install.spec.permissions"
    secondary
    history={history}
    section="permissions"
  >
    TBD
  </OperatorEditorSubPage>
);

OperatorPermissionsPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorPermissionsPage.defaultProps = {
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
)(OperatorPermissionsPage);
