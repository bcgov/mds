import { Typography } from "antd";
import React, { FC } from "react";
import { WrappedFieldProps, WrappedFieldMetaProps, WrappedFieldInputProps } from "redux-form";

// props that should be used directly or extended by input components
export interface BaseInputProps extends WrappedFieldProps {
  meta: WrappedFieldMetaProps;
  input: WrappedFieldInputProps;
  label?: string;
  id: string;
  defaultValue?: any;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  allowClear?: boolean;
}

interface BaseViewInputProps {
  label?: string;
  value: string | number;
}
export const BaseViewInput: FC<BaseViewInputProps> = ({ label = "", value = "" }) => {
  return (
    <>
      {label.length && <Typography.Paragraph strong>{label}</Typography.Paragraph>}
      <Typography.Paragraph>{value.toString()}</Typography.Paragraph>
    </>
  );
};
