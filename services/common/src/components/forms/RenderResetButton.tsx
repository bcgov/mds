import React, { FC, ReactNode, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isDirty, isSubmitting, reset } from "redux-form";
import { FormContext } from "./FormWrapper";
import { Button } from "antd";
import { ButtonProps } from "antd/lib/button/button";

interface RenderResetButtonProps {
    buttonText?: string | ReactNode;
    buttonProps?: ButtonProps & React.RefAttributes<HTMLElement>;
    disableOnClean?: boolean;
    className?: string;
}

const RenderResetButton: FC<RenderResetButtonProps> = ({
    buttonText = "Clear",
    buttonProps,
    disableOnClean = false,
    className
}) => {
    const dispatch = useDispatch();
    const { formName, isEditMode, onReset } = useContext(FormContext);
    const submitting = useSelector(isSubmitting(formName));
    const isFormDirty = useSelector(isDirty(formName));
    const disabled = submitting || (!isFormDirty && disableOnClean);

    const handleReset = async () => {
        await dispatch(reset(formName));
        if (onReset) {
            onReset();
        }
    }

    return (
        <>
            {isEditMode && (
                <Button
                    type="default"
                    disabled={disabled}
                    loading={submitting}
                    htmlType="reset"
                    onClick={handleReset}
                    className={className}
                    {...buttonProps}
                >
                    {buttonText}
                </Button>
            )}
        </>
    );
};

export default RenderResetButton;
