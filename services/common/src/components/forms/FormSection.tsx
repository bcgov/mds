import React, { FC, useContext, createContext } from "react";
import { FormSectionProps, FormSection as ReduxFormSection } from "redux-form";
import { FormContext } from "./FormWrapper";

// Context to provide section name for view mode
export const SectionNameContext = createContext<string>("");

const ViewSection: FC<FormSectionProps<any>> = ({ name, children }) => {
    // Accumulate all parent section names in context, but avoid double-prepending
    const parentSectionName = useContext(SectionNameContext);
    let fullSectionName;
    if (parentSectionName && name) {
        // Only append if name is not already a prefix
        if (name.startsWith(parentSectionName + ".") || name.startsWith(parentSectionName + "[")) {
            fullSectionName = name;
        } else {
            fullSectionName = `${parentSectionName}.${name}`;
        }
    } else {
        fullSectionName = name ?? parentSectionName ?? "";
    }
    return (
        <SectionNameContext.Provider value={fullSectionName}>
            {children}
        </SectionNameContext.Provider>
    );
};

const FormSection: FC<FormSectionProps<any>> = (props) => {
    const { isEditMode } = useContext(FormContext);

    if (isEditMode) {
        return <ReduxFormSection {...props} />;
    }
    return <ViewSection {...props} />;
}

export default FormSection;