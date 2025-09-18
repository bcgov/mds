import React, { FC, useContext } from "react";
import { FieldArray, BaseFieldArrayProps } from "redux-form";
import { FormContext } from "./FormWrapper";
import { getNestedValue } from "./FormField";
import { SectionNameContext } from "./FormSection";

// getNestedValue updated for robust path handling
const ViewFieldArray: FC<BaseFieldArrayProps<any, any>> = ({ name, component: InputComponent, props }) => {
    const { initialValues = {} } = useContext(FormContext);
    const sectionName = useContext(SectionNameContext);

    // Prepend section name only if not already a prefix of field array name
    const fullName = sectionName && name && !(name.startsWith(sectionName + ".") || name.startsWith(sectionName + "[")) ? `${sectionName}.${name}` : name;
    const valueArray = getNestedValue(initialValues, fullName) ?? [];

    const fields = valueArray.map((_v, index) => `${fullName}[${index}]`);
    fields.get = (index) => fields[index];
    return <InputComponent fields={fields} {...props} />
};

const FormFieldArray: FC<BaseFieldArrayProps<any, any>> = (props) => {
    const { isEditMode } = useContext(FormContext);

    if (isEditMode) {
        return <FieldArray {...props} />;
    }
    return <ViewFieldArray {...props} />;
}

export default FormFieldArray;