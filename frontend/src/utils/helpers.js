import { reset } from "redux-form";
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
export const resetForm = (form) => (result, dispatch, props) =>
  props.clearOnSubmit && dispatch(reset(form));

// Function to create a reusable reducer (used in src/reducers/rootReducer)
export const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
};
// Function to create state object using the id as the key (used in src/reducers/<customReducer>)
export const createItemMap = (array, idField) => {
  return array.reduce((result, item) => {
    result[item[idField]] = item;
    return result;
  }, {});
};

// Function create id array for redux state. (used in src/reducers/<customReducer>)
export const createItemIdsArray = (array, idField) => {
  return array.map((item) => item[idField]);
};

export const createDropDownList = (array, labelField, valueField) => 
{
  return array.map((item) => {
    return {'value':item[valueField], 'label':item[labelField]};
  })
}

// Function to create a hash given an array of values and labels
export const createLabelHash = (obj) =>
  obj.reduce((map, { value, label }) => ({ [value]: label, ...map }), {});
