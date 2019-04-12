import * as _ from 'lodash-es';
import { reduxConstants } from './index';

const initialState = {
  operator: {},
  formErrors: {},
  sectionStatus: {
    metadata: 'empty',
    'owned-crds': 'empty',
    'required-crds': 'empty',
    deployments: 'empty',
    permissions: 'empty',
    'cluster-permissions': 'empty',
    'install-modes': 'empty'
  }
};

const editorReducer = (state = initialState, action) => {
  let sectionStatus;

  switch (action.type) {
    case reduxConstants.SET_EDITOR_SECTION_STATUS:
      sectionStatus = _.clone(state.sectionStatus);
      sectionStatus[action.section] = action.status;
      return Object.assign({}, state, { sectionStatus });

    case reduxConstants.SET_EDITOR_OPERATOR:
      return Object.assign({}, state, {
        operator: action.operator
      });

    case reduxConstants.SET_EDITOR_FORM_ERRORS:
      return Object.assign({}, state, {
        formErrors: action.formErrors
      });

    default:
      return state;
  }
};

editorReducer.initialState = initialState;

export { editorReducer };
