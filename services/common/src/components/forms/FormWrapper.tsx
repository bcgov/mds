import React, { FC } from "react";
import { compose } from "@reduxjs/toolkit";
import { connect, useDispatch, useSelector } from "react-redux";
import { reduxForm, submit, getFormSubmitErrors, InjectedFormProps, ConfigProps } from "redux-form";
import { BaseFormWrapper, BaseFormWrapperProps } from "./BaseFormWrapper";


// FormWrapper EXAMPLE USAGE:
/** 
export const MyForm = () => {
  return (
    <FormWrapper 
      name="my_form"
      onSubmit={(values) => doSomething(values)}
      isEditMode={booleanVariable}
      reduxFormConfig={{touchOnChange: true}}
    >
      <Field 
        name="field_name"
        label="Field Name"
        props={{ mySpecificAttribute: someData }} 
        required 
        validate={[required]} 
        component={RenderMyInput}
      />
      ... more Fields
      <Button htmlType="submit">Submit</Button>
    </FormWrapper>
  );
}
PROPS:
- anything in reduxFormConfig will get passed to the reduxForm constructor
- the name of the form is necessary to connect to the store properly
- onSubmit will only be called when there are no submit errors (validation passes)

NOTABLE OMISSIONS:
- 'MyForm' should not include reduxForm, ant design Form or Form.Item

SEE ALSO:
- BaseInput.tsx 
*/
interface FormWrapperProps extends BaseFormWrapperProps {
  reduxFormConfig?: Partial<ConfigProps>;
}

const FormWrapper: FC<FormWrapperProps & InjectedFormProps<any>> = (props) => {
  const dispatch = useDispatch();
  const formErrors = useSelector(getFormSubmitErrors(props.name));

  const handleSubmit = async (values: any) => {
    dispatch(submit(props.name));
    if (!formErrors) {
      await props.onSubmit(values);
    }
  };

  return <BaseFormWrapper {...props} onSubmit={handleSubmit} />;
};

const mapStateToProps = (_state: any, ownProps: FormWrapperProps) => ({
  form: ownProps.name,
  initialValues: ownProps.initialValues,
  ...ownProps.reduxFormConfig,
});

export default compose(
  connect(mapStateToProps),
  reduxForm({})
)(FormWrapper as any) as FC<FormWrapperProps>;

export { FormContext } from "./BaseFormWrapper";