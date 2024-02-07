import { Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { requiredRadioButton } from "@common/utils/Validate";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import { FORM, IOrgbookCredential } from "@mds/common";
import OrgBookSearch from "@mds/common/components/parties/OrgBookSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleX, faSpinner } from "@fortawesome/pro-light-svg-icons";
import { isEmpty } from "lodash";
import { verifyOrgBookCredential } from "@mds/common/redux/actionCreators/orgbookActionCreator";

const { Title, Paragraph } = Typography;

const Applicant = () => {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState<IOrgbookCredential>(null);
  const [verified, setVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { applicant_type = "" } = formValues;

  useEffect(() => {
    setVerified(false);
    setCheckingStatus(true);
    if (credential) {
      dispatch(verifyOrgBookCredential(credential.id)).then((response) => {
        setVerified(response.success);
        setCheckingStatus(false);
      });
    }
  }, [credential]);

  useEffect(() => {
    setCredential(null);
  }, [applicant_type]);

  const findBusinessNumber = (obj: any): string => {
    // Check if the object is a dictionary and has a "type" field with value of "business_number"
    if (
      typeof obj === "object" &&
      obj !== null &&
      Object.prototype.hasOwnProperty.call(obj, "type") &&
      obj.type === "business_number"
    ) {
      return obj.text;
    }

    // Iterate over all keys of the object, go deeper if the value is an object itself or an array
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        const result = findBusinessNumber(obj[key]);

        // return the result if 'result' is not null
        if (result) {
          return result;
        }
      }
    }

    // Return '-' if no business_number is found
    return "-";
  };

  const renderStatus = () => {
    let icon = faSpinner;
    let color = undefined;
    let text = undefined;

    if (!checkingStatus) {
      if (verified) {
        icon = faCircleCheck;
        color = "#45A766";
        text = "Verified on Orgbook BC";
      } else {
        icon = faCircleX;
        color = "#D8292F";
        text = "Not registered on Orgbook BC";
      }
    }

    return (
      <Paragraph strong className="light">
        <FontAwesomeIcon
          size="lg"
          color={color}
          icon={icon}
          spin={checkingStatus}
          className="margin-medium--right"
        />
        {text}
      </Paragraph>
    );
  };

  return (
    <div className="ant-form-vertical">
      <Title level={3}>Applicant Information</Title>
      <Paragraph>This must be the name of the company or person seeking authorization.</Paragraph>
      <Field
        name="applicant_type"
        id="applicant_type"
        required
        validate={[requiredRadioButton]}
        label="Applicant Type"
        component={RenderRadioButtons}
        customOptions={[
          { label: "Business", value: "BUS" },
          { label: "Company", value: "ORG" },
          {
            label: "Individual",
            value: "IND",
          },
        ]}
      />
      {["BUS", "ORG"].includes(applicant_type) && (
        <div>
          <OrgBookSearch setCredential={setCredential} />
          {!isEmpty(credential) && (
            <div className="table-summary-card">
              {renderStatus()}
              {findBusinessNumber(credential) !== "-" && (
                <Paragraph className="light margin-none">
                  Business Number: {findBusinessNumber(credential)}
                </Paragraph>
              )}
              <Paragraph className="light margin-none">BC Registries ID: {credential.id}</Paragraph>
              <Paragraph className="light margin-none">
                BC Registration Status {credential.inactive ? "Inactive" : "Active"}
              </Paragraph>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Applicant;
