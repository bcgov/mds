import React from "react";
import { Typography } from "antd";
import { Field } from "../../forms/form";
import RenderField from "../../forms/RenderField";
import { maxLength, required, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import RenderRadioButtons from "../../forms/RenderRadioButtons";

const EnvBasicInformationTab = () => {
    return (
        <>
            <Typography.Title level={3}>Basic Information</Typography.Title>
            <Field
                id="submitter_name"
                name="submitter_name"
                label="Submitter Name"
                required
                component={RenderField}
                validate={[maxLength(255), required]}
            />
            <Field
                name="is_agent"
                id="is_agent"
                required
                validate={[requiredRadioButton]}
                label="The person submitting this application is:"
                component={RenderRadioButtons}
                isVertical
                customOptions={[
                    { label: "the Applicant, as named in the project description", value: false },
                    { label: "the Agent, as named in the project description", value: true },
                ]}
            />
        </>
    );
};

export default EnvBasicInformationTab;