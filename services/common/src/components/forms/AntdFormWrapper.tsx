import { FC } from "react";
import { FormInstance } from "antd";
import React from "react";
import { BaseFormWrapper, BaseFormWrapperProps } from "./BaseFormWrapper";

interface AntdFormWrapperProps extends BaseFormWrapperProps {
    form?: FormInstance;
    antdOptions?: {
        enableReinitialize: boolean;
    };
}

const AntdFormWrapper: FC<AntdFormWrapperProps> = (props) => {
    return <BaseFormWrapper {...props} />;
};

export default AntdFormWrapper;