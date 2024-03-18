import React, { useState, FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Field,
  FieldArray,
  FormSection,
  arrayPush,
  arrayRemove,
  change,
  getFormValues,
} from "redux-form";
import { Typography, Checkbox, Tooltip } from "antd";
import DownOutlined from "@ant-design/icons/DownOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import {
  getTransformedProjectSummaryAuthorizationTypes,
  getDropdownProjectSummaryPermitTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getFormattedProjectSummary } from "@mds/common/redux/selectors/projectSelectors";
import { required, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import Callout from "@mds/common/components/common/Callout";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderGroupCheckbox, {
  normalizeGroupCheckBox,
} from "@mds/common/components/forms/RenderGroupCheckbox";
import RenderCheckbox from "@/components/common/RenderCheckbox";

const RenderAuthPermitSection: FC<{ permitTypes: string[] }> = ({ permitTypes = [] }) => {
  if (!(permitTypes?.length > 0)) {
    return null;
  }
  console.log(permitTypes, permitTypes.includes("NEW"));
  return (
    <div>
      {permitTypes.includes("AMENDMENT") && <div>amendment stuff</div>}
      {permitTypes.includes("NEW") && <div>new stuff</div>}
    </div>
  );
};
const RenderAuthCodeFormSection = ({ code, authIndex }) => {
  const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  const { authorizations } = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { project_summary_permit_type } = authorizations[authIndex];
  console.log(authorizations[authIndex], project_summary_permit_type);
  return (
    <>
      <Field
        name="project_summary_permit_type"
        props={{
          options: dropdownProjectSummaryPermitTypes,
          label: "What type of permit is involved in your application?",
        }}
        component={RenderGroupCheckbox}
        required
        validate={[required]}
        normalize={normalizeGroupCheckBox}
      />
      <RenderAuthPermitSection permitTypes={project_summary_permit_type} />
    </>
  );
};
export const AuthorizationsInvolved = () => {
  const dispatch = useDispatch();
  const transformedProjectSummaryAuthorizationTypes = useSelector(
    getTransformedProjectSummaryAuthorizationTypes
  );
  // const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  const formattedProjectSummary = useSelector(getFormattedProjectSummary);
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));

  const [authorizationOptions, setAuthorizationOptions] = useState(
    formattedProjectSummary?.authorizationOptions ?? []
  );

  const handleChange = (e, code, authIndex) => {
    if (e.target.checked) {
      setAuthorizationOptions([...authorizationOptions, code]);
      const { project_summary_guid } = formValues;
      const formVal = { project_summary_guid, project_summary_authorization_type: code };
      dispatch(arrayPush(FORM.ADD_EDIT_PROJECT_SUMMARY, "authorizations", formVal));
    } else {
      setAuthorizationOptions(authorizationOptions.filter((item) => item !== code));
      // dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, code, null));
      dispatch(arrayRemove(FORM.ADD_EDIT_PROJECT_SUMMARY, "authorizations", authIndex));
    }
  };

  useEffect(() => {
    console.log("formValues", formValues);
  }, [formValues]);

  return (
    <>
      <Typography.Title level={3}>
        Authorizations potentially involved in the project
      </Typography.Title>
      <Callout
        message="Please select the authorizations that you anticipate needing for this project, based
        on your current understanding. This is to assist in planning and may not be the
        complete list for the final application."
      />
      <br />
      <Typography.Title level={5}>
        Mines Review Committee
        <Tooltip
          overlayClassName="minespace-tooltip"
          title={
            <p>
              Learn more about the{" "}
              <a
                href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/coordinated-authorizations/mine-mrc#:~:text=A%20Mine%20Review%20Committee%20(MRC,of%20the%20coordinated%20authorizations%20process."
                target="_blank"
                rel="noopener noreferrer"
              >
                Mines Review Committee
              </a>
              .
            </p>
          }
          placement="right"
          mouseEnterDelay={0.3}
        >
          <InfoCircleOutlined className="padding-sm" />
        </Tooltip>
      </Typography.Title>
      <Field
        id="mrc_review_required"
        name="mrc_review_required"
        label={
          <>
            <p>
              Mine review committees (MRCs) are a key part of the coordinated authorizations
              process. An MRC is an advisory committee established by the Chief Permitting Officer
              (CPO) under Section 9 of the Mines Act. By bringing together multiple ministries,
              Indigenous nations, federal and local governments, and other reviewers, MRCs increase
              efficiency and effectiveness by reducing duplication of effort and by focusing on the
              project as a whole.
            </p>
            <p>
              <b>
                Does your project require a coordinated review by a Mine Review Committee, under
                Section 9 of the Mines Act?
              </b>{" "}
              This response will be reviewed by the Major Mines Office and confirmed by the Chief
              Permitting Officer.
            </p>
          </>
        }
        component={RenderRadioButtons}
        required
        validate={[requiredRadioButton]}
      />
      <br />
      {transformedProjectSummaryAuthorizationTypes.map((authorization) => {
        return (
          <React.Fragment key={authorization.code}>
            <Typography.Title level={5}>{authorization.description}</Typography.Title>
            {authorization.children.map((child) => {
              const authIndex = authorizationOptions.indexOf(child.code);
              const checked = authIndex > -1;
              return (
                <FormSection key={child.code} name={`authorizations[${authIndex}]`}>
                  <>
                    <Checkbox
                      value={child.code}
                      checked={checked}
                      onChange={(e) => handleChange(e, child.code, authIndex)}
                    >
                      {checked ? (
                        <>
                          {child.description} <DownOutlined />
                        </>
                      ) : (
                        child.description
                      )}
                    </Checkbox>
                    {checked && (
                      <RenderAuthCodeFormSection code={child.code} authIndex={authIndex} />
                    )}
                  </>
                </FormSection>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default AuthorizationsInvolved;
