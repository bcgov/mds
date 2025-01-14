import React, { FC, useEffect } from "react";
import { Form, FormInstance } from "antd";
import { FormProvider } from "./FormWrapper";


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
    onSubmit: (values) => void | Promise<void>;
    children: any;
    isModal?: boolean;
    loading?: boolean;
    isEditMode?: boolean;
    scrollOnToggleEdit?: boolean;
    form?: FormInstance,
    layout?: "inline" | "horizontal" | "vertical";
    antdOptions?: {
        enableReinitialize: boolean;
    }
}


const AntdFormWrapper: FC<FormWrapperProps> = ({
    isEditMode = true,
    isModal = false,
    scrollOnToggleEdit = true,
    children,
    layout,
    form,
    antdOptions,
    initialValues,
    ...props
}) => {
    const providerValues = {
        isEditMode,
        isModal,
        formName: props.name,
        isReduxForm: false,
    };
    const [frm] = form ? [form] : Form.useForm();

    useEffect(() => {
        if (scrollOnToggleEdit) {
            window.scrollTo(0, 0);
        }
    }, [isEditMode]);

    const handleSubmit = async (values) => {
        await props.onSubmit(values);
    };

    const formClassName = `common-form common-form-${props.name} form-${isEditMode ? "edit" : "view"}`;

    return (
        <FormProvider value={providerValues}>
            <Form
                form={frm}
                layout={layout ?? "vertical"}
                onFinish={handleSubmit}
                name={props.name}
                className={formClassName}
                initialValues={initialValues}
                scrollToFirstError={true}
            >
                {children}
            </Form>
        </FormProvider>
    );
};

export default AntdFormWrapper