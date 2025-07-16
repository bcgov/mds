import { IPermitConditionTag } from "@mds/common/interfaces"
import React, { FC } from "react"
import { Field } from "redux-form"
import {
  required,
  maxLength,
} from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { createPermitConditionTag, updatePermitConditionTag } from "@mds/common/redux/slices/permitConditionTagSlice";

export const TagEditForm: FC<{
    existingTag: IPermitConditionTag
    formName: string
    handleClose?: () => void
}> = ({existingTag = null, formName, handleClose = null}) => {

    const dispatch = useAppDispatch();

    const handleSubmit = async (values) => {
        if(existingTag){
            await dispatch(updatePermitConditionTag(values))
        } else {
            await dispatch(createPermitConditionTag(values))
        }
        if (handleClose) {
            handleClose();
        }
    }

    return (
        <FormWrapper
            name={formName}
            initialValues={existingTag}
            onSubmit={handleSubmit}
            isModal={true}
        >
            <Field
                label="Name"
                required
                validate={[required, maxLength(255)]}
                name="description"
                component={RenderField}
            />
            <RenderSubmitButton
              buttonText={existingTag ? "Save Tag" : "Add Tag"}
            />
        </FormWrapper>
    )
}