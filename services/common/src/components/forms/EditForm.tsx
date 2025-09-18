import React, { FC } from "react";
import { Form } from "antd";
import { compose } from "@reduxjs/toolkit";
import { connect, useDispatch, useSelector } from "react-redux";
import {
    ConfigProps,
    reduxForm,
    submit,
    getFormSubmitErrors,
    InjectedFormProps,
} from "@mds/common/components/forms/form";

interface EditFormProps {
    children: any;
    layout?: "inline" | "horizontal" | "vertical";
    name: string;
    initialValues?: any;
    onSubmit?: (values) => void | Promise<void>;
    reduxFormConfig?: Partial<ConfigProps>;
    formClassName: string;
}

const EditForm: FC<EditFormProps & InjectedFormProps<any>> = ({
    children,
    layout,
    name,
    initialValues,
    onSubmit,
    formClassName,
}) => {

    const dispatch = useDispatch();
    const formErrors = useSelector(getFormSubmitErrors(name));

    const handleSubmit = async (values) => {
        dispatch(submit(name));
        if (!formErrors && onSubmit) {
            await onSubmit(values);
        }
    };

    return (
        <Form
            layout={layout}
            onFinish={handleSubmit}
            name={name}
            className={formClassName}
            initialValues={initialValues}
        >{children}</Form>
    );
};

const mapStateToProps = (_state, ownProps) => ({
    form: ownProps.name,
    initialValues: ownProps.initialValues,
    ...ownProps.reduxFormConfig,
});

export default compose(connect(mapStateToProps), reduxForm({}))(EditForm as any) as FC<EditFormProps>;