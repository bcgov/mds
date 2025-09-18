import React, { FC, useContext } from "react";
import { Field, BaseFieldProps, GenericFieldHTMLAttributes } from "redux-form";
import { FormContext } from "./FormWrapper";
import { SectionNameContext } from "./FormSection";

export const getNestedValue = (obj: any, path: string) => {
    // Convert [index] to .index and split on dots
    if (!path) return undefined;
    const parts = path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);
    return parts.reduce((acc, part) => (acc !== undefined && acc !== null ? acc[part] : undefined), obj);
};

const ViewField: FC<GenericFieldHTMLAttributes | BaseFieldProps<any> & any> = (props) => {
    const { initialValues = {} } = useContext(FormContext);
    const sectionName = useContext(SectionNameContext);
    const { component: InputComponent, name, label, props: passedProps = {}, ...rest } = props;
    let extraProps: any = {};
    if (rest.timezoneFieldProps?.name) {
        extraProps.timezone = initialValues[rest.timezoneFieldProps.name];
    }

    // Prepend section name only if not already a prefix of field name
    const fullName = sectionName && name && !(name.startsWith(sectionName + ".") || name.startsWith(sectionName + "[")) ? `${sectionName}.${name}` : name;
    const value = getNestedValue(initialValues, fullName) ?? "";
    const input = {
        name: fullName,
        value
    };
    const meta = {
        touched: false,
    };
    return <InputComponent input={input} meta={meta} label={label} disabled {...extraProps} {...rest} {...passedProps} />;
};

const FormField: FC<GenericFieldHTMLAttributes | BaseFieldProps<any> & any> = (props) => {
    const { isEditMode } = useContext(FormContext);

    if (isEditMode) {
        return <Field {...props} />;
    }
    return <ViewField {...props} />;
}

export default FormField;