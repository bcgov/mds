import React, { FC, ReactNode, useContext } from "react";
import { useSelector } from "react-redux";
import { isDirty, isSubmitting } from "redux-form";
import { FormContext } from "./FormWrapper";
import { Button } from "antd";
import { BaseButtonProps } from "antd/lib/button/button";

interface RenderSubmitButtonProps {
  buttonText?: string | ReactNode;
  buttonProps?: BaseButtonProps;
}

const RenderSubmitButton: FC<RenderSubmitButtonProps> = ({
  buttonText = "Save Changes",
  buttonProps,
}) => {
  const { formName, isEditMode } = useContext(FormContext);
  const submitting = useSelector(isSubmitting(formName));
  const isFormDirty = useSelector(isDirty(formName));

  return (
    <>
      {isEditMode && (
        <Button
          type="primary"
          disabled={!isFormDirty || submitting}
          loading={submitting}
          htmlType="submit"
          {...buttonProps}
        >
          {buttonText}
        </Button>
      )}
    </>
  );
};

export default RenderSubmitButton;
