import React, { FC, useEffect } from "react";
import {
  ConfigProps,
  getFormValues,
} from "@mds/common/components/forms/form";
import EditForm from "./EditForm";
import ViewForm from "./ViewForm";
import { useSelector } from "react-redux";

export interface IFormContext {
  isEditMode: boolean;
  isModal: boolean;
  formName: string;
  onReset: () => void | Promise<void>;
  initialValues: any;
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
  onReset: undefined,
  initialValues: {},
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
export interface FormWrapperProps {
  name: string;
  initialValues?: any;
  reduxFormConfig?: Partial<ConfigProps>;
  onSubmit?: (values) => void | Promise<void>;
  onReset?: () => void | Promise<void>;
  children: any;
  isModal?: boolean;
  loading?: boolean;
  isEditMode?: boolean;
  scrollOnToggleEdit?: boolean;
  layout?: "inline" | "horizontal" | "vertical";
  forceRedux?: boolean;
}

const FormWrapper: FC<FormWrapperProps> = ({
  isEditMode = true,
  isModal = false,
  scrollOnToggleEdit = true,
  forceRedux = false,
  children,
  layout = "vertical",
  onReset,
  ...props
}) => {

  const initialValues = useSelector((state) => {
    if (!isEditMode && forceRedux) {
      return getFormValues(props.name)(state);
    }
    return props.initialValues;
  });

  const providerValues = {
    isEditMode,
    isModal,
    formName: props.name,
    initialValues: initialValues,
    onReset,
  };

  useEffect(() => {
    if (scrollOnToggleEdit) {
      window.scrollTo(0, 0);
    }
  }, [isEditMode]);

  const formClassName = `common-form common-form-${props.name} form-${isEditMode ? "edit" : "view"
    }`;

  const formElement = isEditMode || forceRedux
    ? <EditForm
      layout={layout}
      name={props.name}
      initialValues={props.initialValues}
      onSubmit={props.onSubmit}
      formClassName={formClassName}
      reduxFormConfig={props.reduxFormConfig}
    >{children}</EditForm>
    : <ViewForm
      layout={layout}
      initialValues={props.initialValues}
      name={props.name}
      formClassName={formClassName}
    >{children}</ViewForm>;


  return (
    <FormProvider value={providerValues}>
      {formElement}
    </FormProvider>
  );
};

export default FormWrapper;
