import React, { FC, useEffect } from "react";
import { Form } from "antd";
import { compose } from "@reduxjs/toolkit";
import { connect, useDispatch, useSelector } from "react-redux";
import { reduxForm, submit, getFormSubmitErrors, InjectedFormProps, ConfigProps } from "redux-form";

export interface IFormContext {
  isEditMode: boolean;
  isModal: boolean;
  formName: string;
}
/**
 * The values in FormProvider (from FormWrapper props) will be passed down to child components
 * without having to pass them down through the whole tree, manually
 * Import FormConsumer to access these values within an input component
 * More attributes can be added if necessary, but it should be kept minimal
 */
export const FormContext = React.createContext<IFormContext>({
  isEditMode: true,
  isModal: false,
  formName: null,
});
export const { Provider: FormProvider, Consumer: FormConsumer } = FormContext;

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
interface FormWrapperProps {
  name: string;
  initialValues?: any;
  reduxFormConfig?: Partial<ConfigProps>;
  onSubmit: (values) => void | Promise<void>;
  children: any;
  isModal?: boolean;
  loading?: boolean;
  isEditMode?: boolean;
  scrollOnToggleEdit?: boolean;
}

const FormWrapper: FC<FormWrapperProps & InjectedFormProps<any>> = ({
  isEditMode = true,
  isModal = false,
  scrollOnToggleEdit = true,
  children,
  ...props
}) => {
  const providerValues = {
    isEditMode,
    isModal,
    formName: props.name,
  };
  const dispatch = useDispatch();
  const formErrors = useSelector(getFormSubmitErrors(props.name));

  useEffect(() => {
    if (scrollOnToggleEdit) {
      window.scrollTo(0, 0);
    }
  }, [isEditMode]);

  const handleSubmit = async (values) => {
    dispatch(submit(props.name));
    if (!formErrors) {
      await props.onSubmit(values);
    }
  };

  const formClassName = `common-form common-form-${props.name} form-${
    isEditMode ? "edit" : "view"
  }`;

  return (
    <FormProvider value={providerValues}>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        name={props.name}
        className={formClassName}
        initialValues={props.initialValues}
      >
        {children}
      </Form>
    </FormProvider>
  );
};

const mapStateToProps = (_state, ownProps) => ({
  form: ownProps.name,
  initialValues: ownProps.initialValues,
  ...ownProps.reduxFormConfig,
});
export default compose(connect(mapStateToProps), reduxForm({}))(FormWrapper as any) as FC<
  FormWrapperProps
>;
