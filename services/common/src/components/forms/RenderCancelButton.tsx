import React, { FC, ReactNode, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isDirty } from "redux-form";
import { FormContext } from "./FormWrapper";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { Button, Modal, ModalFuncProps } from "antd";
import { BaseButtonProps } from "antd/lib/button/button";

export const cancelConfirmWrapper = (
  cancelFunction,
  isFormDirty: boolean,
  modalProps?: ModalFuncProps
) => {
  return !isFormDirty
    ? cancelFunction()
    : Modal.confirm(
        modalProps ?? {
          title: "Discard changes?",
          content: "All changes made will not be saved.",
          onOk: cancelFunction,
          cancelText: "Continue Editing",
          okText: "Discard",
        }
      );
};

interface RenderCancelButtonProps {
  buttonText?: string | ReactNode;
  buttonProps?: BaseButtonProps;
  cancelFunction?: () => void | Promise<void>;
  cancelModalProps?: ModalFuncProps;
}

/**
 * a generic cancel button
 * will close a modal if it's in one
 * - no need to pass in a cancelFunction if that's all that's desired
 * - will show a confirm if the form is dirty
 * Uses FormContext to determine if form is dirty or within a modal
 * - intended for use with FormWrapper
 */
const RenderCancelButton: FC<RenderCancelButtonProps> = ({
  buttonText = "Cancel",
  buttonProps = { type: "default" },
  cancelFunction,
  cancelModalProps,
}) => {
  const dispatch = useDispatch();
  const { formName, isModal } = useContext(FormContext);
  const isFormDirty = useSelector(isDirty(formName));

  const handleCancel = () => {
    if (cancelFunction) {
      cancelFunction();
    }
    if (isModal) {
      dispatch(closeModal());
    }
  };
  return (
    <Button
      {...buttonProps}
      onClick={() => cancelConfirmWrapper(handleCancel, isFormDirty, cancelModalProps)}
    >
      {buttonText}
    </Button>
  );
};

export default RenderCancelButton;
