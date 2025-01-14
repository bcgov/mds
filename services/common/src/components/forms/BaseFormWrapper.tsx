
import React, { FC, useEffect } from "react";
import { Form } from "antd";

export interface IFormContext {
    isEditMode: boolean;
    isModal: boolean;
    formName: string;
    isReduxForm: boolean;
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
    isReduxForm: true,
});
export const { Provider: FormProvider, Consumer: FormConsumer } = FormContext;
export const useFormContext = () => React.useContext(FormContext);


export interface BaseFormWrapperProps {
    name: string;
    initialValues?: any;
    onSubmit: (values: any) => void | Promise<void>;
    children: React.ReactNode;
    isModal?: boolean;
    loading?: boolean;
    isEditMode?: boolean;
    scrollOnToggleEdit?: boolean;
    layout?: "inline" | "horizontal" | "vertical";
}

export const BaseFormWrapper: FC<BaseFormWrapperProps> = ({
    isEditMode = true,
    isModal = false,
    scrollOnToggleEdit = true,
    children,
    layout,
    name,
    onSubmit,
    initialValues,
}) => {
    useEffect(() => {
        if (scrollOnToggleEdit) {
            window.scrollTo(0, 0);
        }
    }, [isEditMode]);

    const providerValues = {
        isEditMode,
        isModal,
        formName: name,
        isReduxForm: false,
    };

    const formClassName = `common-form common-form-${name} form-${isEditMode ? "edit" : "view"
        }`;

    return (
        <FormProvider value={providerValues}>
            <Form
                layout={layout ?? "vertical"}
                onFinish={onSubmit}
                name={name}
                className={formClassName}
                initialValues={initialValues}
            >
                {children}
            </Form>
        </FormProvider>
    );
};