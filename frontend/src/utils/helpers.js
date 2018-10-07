import { reset } from 'redux-form';
/**
 * Helper function to clear redux form after submission
 * 
 * Usage:
 *  export default (reduxForm({
    form: formName,
    onSubmitSuccess: resetForm(formName),
  })(Component)
  );
 * 
 */
export const resetForm = (form) => (result, dispatch) => dispatch(reset(form));