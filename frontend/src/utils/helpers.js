import { reset } from 'redux-form';

/**
 * Helper function to clear redux form after submission, pass into export:
 *
 *  export default (reduxForm({
    form: formName,
    onSubmitSuccess: afterSubmit(formName),
  })(Component)
  );
 * 
 */
export const resetForm = (form) => (result, dispatch) => dispatch(reset(form));