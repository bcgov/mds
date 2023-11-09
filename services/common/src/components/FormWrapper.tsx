import { Button, Row, Typography } from "antd";
import React from "react";

export const { Provider: FormProvider, Consumer: FormConsumer } = React.createContext({
  view: false,
});

interface FormWrapperProps {
  name: string;
  onSubmit: any;
  children: any;
  showFooter?: boolean;
  okText?: string;
  onOk?: any;
  cancelText?: string;
  onCancel?: any;
  loading?: boolean;
  view?: boolean;
}
// why not antd v4 form? The submit doesn't work with redux.
const FormWrapper = ({
  name,
  onSubmit,
  children,
  showFooter = true,
  okText = "Submit",
  cancelText = "Cancel",
  onOk = () => {},
  onCancel = () => {},
  loading = false,
  view = false,
}: FormWrapperProps) => {
  const getFooter = () => {
    if (!showFooter || view) {
      return null;
    }
    return (
      <Row className="flex-between form-button-container-row">
        {onCancel && (
          <Button className="full-mobile" type="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        {(onOk || okText) && (
          <Button
            onClick={onOk || null}
            loading={loading}
            type="primary"
            className="full-mobile"
            htmlType="submit"
          >
            {okText}
          </Button>
        )}
      </Row>
    );
  };

  return (
    <FormProvider value={{ view }}>
      <form id={name} name={name} className="ant-form ant-form-vertical" onSubmit={onSubmit}>
        {children}
        {getFooter()}
      </form>
    </FormProvider>
  );
};

// general use for showing data
export const ViewFormDataItem = (label = "", value: string | number = "") => {
  return (
    <>
      {label.length && <Typography.Paragraph strong>{label}</Typography.Paragraph>}
      <Typography.Paragraph>{value}</Typography.Paragraph>
    </>
  );
};

// inputs should extend (if necessary) same base props type
export interface BaseInputProps {
  label: string;
  id: string;
  defaultValue?: any;

  placeholder?: string;
  meta?: any;
  input?: any;
  disabled?: boolean;
  allowClear?: boolean;
  required?: boolean;
}

export default FormWrapper;
