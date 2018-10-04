import { reset } from 'redux-form';
import { uniq } from 'lodash';

/**
 * Helper function to clear redux form after submission, pass into export:
 *
 *  export default (reduxForm({
    form: formName,
    onSubmitSuccess: resetForm(formName),
  })(Component)
  );
 * 
 */
export const resetForm = (form) => (result, dispatch) => dispatch(reset(form));

/**
 * Helper function to remove duplicates from an array
 */

 export const removeDuplicates = (arr) => { console.log(uniq(arr));}