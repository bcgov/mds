import React from "react";
import { Typography } from "antd";
import { Field } from "../../forms/form";
import RenderField from "../../forms/RenderField";
import { maxLength, required, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import RenderRadioButtons from "../../forms/RenderRadioButtons";

interface EnvBasicInformationTabProps {
    trackingNumber: string;
}
const EnvBasicInformationTab: React.FC<EnvBasicInformationTabProps> = ({
    trackingNumber,
}) => {
    return (
        <>
            <Typography.Paragraph>
                This process is for the final application submission for your waste discharge application for tracking number {trackingNumber}
            </Typography.Paragraph>
            <Typography.Paragraph>
                If you are submitting a joint Mines Act (MA) / Environmental Management Act (EMA) application,
                please upload any files that are relevant to the Joint Application package under the MA Application Tab.
                This ensures coordinated review and alignment with the Joint Application Information Requirements.
            </Typography.Paragraph>
            <Typography.Paragraph>
                For joint applications, files specific to the EMA application: Application Instruction Document,
                Discharge Factors Form, Clause Amendment Form, Location Map, Information Requirements Table,
                should be uploaded on the following documents page.
            </Typography.Paragraph>
            <Typography.Paragraph>
                For EMA only applications please upload all documents for your final application on the following documents page.
            </Typography.Paragraph>
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