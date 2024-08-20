import React, { FC, ReactNode, useContext } from "react";
import { useSelector } from "react-redux";
import { isDirty, isSubmitting } from "redux-form";
import { FormContext } from "./FormWrapper";
import { Button } from "antd";
import { ButtonProps } from "antd/lib/button/button";

interface RenderSubmitButtonProps {
  buttonText?: string | ReactNode;
  buttonProps?: ButtonProps & React.RefAttributes<HTMLElement>;
  disableOnClean?: boolean;
}

const RenderSubmitButton: FC<RenderSubmitButtonProps> = ({
  buttonText = "Save Changes",
  buttonProps,
  disableOnClean = true,
}) => {
  const { formName, isEditMode } = useContext(FormContext);
  const submitting = useSelector(isSubmitting(formName));
  const isFormDirty = useSelector(isDirty(formName));
  const disabled = submitting || (!isFormDirty && disableOnClean);

  return (
    <>
      {isEditMode && (
        <Button
          type="primary"
          disabled={disabled}
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
