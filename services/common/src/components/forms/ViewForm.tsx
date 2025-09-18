import React, { FC } from "react";
import { Form } from "antd";

interface ViewFormProps {
    children: any;
    layout: "inline" | "horizontal" | "vertical";
    initialValues: any;
    name: string;
    formClassName: string;
}
const ViewForm: FC<ViewFormProps> = ({
    children,
    layout,
    initialValues,
    name,
    formClassName,
}) => {

    return (
        <Form
            layout={layout}
            onFinish={() => { }}
            name={name}
            className={formClassName}
            initialValues={initialValues}
        >{children}</Form>
    );
};

export default ViewForm;