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
    <div className="view-item">
      {label.length && (
        <Typography.Paragraph className="view-item-label">{label}</Typography.Paragraph>
      )}
      <Typography.Paragraph className="view-item-value">{value.toString()}</Typography.Paragraph>
    </div>
  );
};

// for consistent formatting of optional field indicator
export const getFormItemLabel = (label: string, isRequired: boolean) => {
  if (!label) {
    return "";
  }
  if (isRequired) {
    return label;
  }
  return (
    <>
      {label} <span className="form-item-optional">&nbsp;(optional)</span>
    </>
  );
};
