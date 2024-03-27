import React, { useState } from "react";
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
import { Typography, Checkbox, Tooltip, Alert, Button, Row, Col } from "antd";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import {
  getTransformedProjectSummaryAuthorizationTypes,
  getDropdownProjectSummaryPermitTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getAmsAuthorizationTypes } from "@mds/common/redux/selectors/projectSelectors";
import {
  digitCharactersOnly,
  maxLength,
  required,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderGroupCheckbox, {
  normalizeGroupCheckBox,
} from "@mds/common/components/forms/RenderGroupCheckbox";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import { exactLength, number } from "@common/utils/Validate";

const RenderEMAPermitCommonSections = ({ isAmendment }) => {
  const purposeLabel = isAmendment
    ? "Additional Amendment Request Information"
    : "Purpose of Application";
  const [showDocSection, setShowDocSection] = useState(false);

  const onChange = (value, _newVal, _prevVal, _fieldName) => {
    setShowDocSection(value);
  };
  return (
    <>
      <Field
        label={purposeLabel}
        name="authorization_description"
        required
        validate={[required, maxLength(4000)]}
        maximumCharacters={4000}
        minRows={2}
        component={RenderAutoSizeField}
        placeholder="e.g. To Discharge air emissions from x number of stacks at a sawmill."
      />
      <Field
        component={RenderRadioButtons}
        name="exemption_requested"
        required
        onChange={onChange}
        validate={[requiredRadioButton]}
        label={
          <>
            Pre-Application Exemption Request for Environmental Management Act application
            <Tooltip title="This request for an exemption is an option intended for applicants that have previous experience with permitting under the Environmental Management Act and do not require a meeting with the Ministry to clarify requirements.">
              <InfoCircleOutlined />
            </Tooltip>
          </>
        }
      />
      {showDocSection && (
        <Alert
          description={
            <>
              If yes, please attach a <b>letter with rationale</b> to support this exemption at{" "}
              <b>Document Upload</b> section. Please note that requests may not always be granted.
              Incomplete applications may be returned if they don&apos;t meet Ministry requirements
              and the application fee may not be refunded.
            </>
          }
          showIcon
        />
      )}
    </>
  );
};
const RenderEMANewPermitSection = ({ code }) => {
  return (
    <div className="grey-box">
      <FormSection name={`${code}.NEW[0]`}>
        <Field
          name="new_type"
          isVertical
          label="Authorization Type"
          customOptions={[
            {
              label: (
                <>
                  Permit
                  <br />
                  <span className="label-subtitle">
                    Authorization to discharge waste to the environment; an ongoing authorization.
                  </span>
                </>
              ),
              value: "PER",
            },
            {
              label: (
                <>
                  Approval
                  <br />
                  <span className="label-subtitle">
                    Temporary authorization to discharge waste to the environment for a maximum of
                    15 months.
                  </span>
                </>
              ),
              value: "APP",
            },
          ]}
          component={RenderRadioButtons}
          required
          validate={[requiredRadioButton]}
        />
        <RenderEMAPermitCommonSections isAmendment={false} />
      </FormSection>
    </div>
  );
};

const RenderEMAAmendFieldArray = ({ fields }) => {
  const handleRemoveAmendment = (index: number) => {
    fields.remove(index);
  };

  return (
    <div className="grey-box">
      {fields.map((amendment: string, index) => (
        <FormSection name={amendment} key={amendment}>
          <Field
            label={
              <Row justify="space-between" style={{ flexBasis: "100%" }}>
                <Col>Authorization Number</Col>
                <Col>
                  <Button onClick={() => handleRemoveAmendment(index)}>Cancel</Button>
                </Col>
              </Row>
            }
            name="existing_permits_authorizations[0]"
            required
            validate={[required, exactLength(4), digitCharactersOnly]}
            help="Number only (e.g. PC1234 should be entered as 1234)"
            component={RenderField}
          />
          <Field
            label="Amendment Type"
            name="amendment_severity"
            help="As defined in the Environmental Management Act Public Notification Regulation"
            required
            validate={[requiredRadioButton]}
            component={RenderRadioButtons}
            customOptions={[
              { label: "Significant", value: "SIG" },
              { label: "Minor", value: "MIN" },
            ]}
          />
          <Field
            label="Amendment Changes Requested that relate to the British Columbia Environmental Act (Select all that apply)"
            name="amendment_changes"
            required
            validate={[required]}
            component={RenderGroupCheckbox}
            normalize={normalizeGroupCheckBox}
            options={[
              { label: "Increase Discharge Limit (<10%)", value: "ILT" },
              { label: "Increase Discharge Limit (>10%)", value: "IGT" },
              { label: "Decrease Discharge Limit", value: "DDL" },
              { label: "Name Change", value: "NAM" },
              { label: "Transfer", value: "TRA" },
              { label: "Modify Monitoring Requirements", value: "MMR" },
              { label: "Regulatory Change", value: "RCH" },
              { label: "Other", value: "OTH" },
            ]}
          />
          <Field
            label="Is this Authorization required for remediation of a contaminated site?"
            name="is_contaminated"
            required
            validate={[requiredRadioButton]}
            component={RenderRadioButtons}
          />
          <RenderEMAPermitCommonSections isAmendment={true} />
        </FormSection>
      ))}
    </div>
  );
};

const RenderEMAAuthCodeFormSection = ({ code }) => {
  const { authorizations } = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const codeAuthorizations = authorizations[code] ?? [];
  const hasAmendments = codeAuthorizations.AMENDMENT?.length > 0;
  const hasNew = codeAuthorizations.NEW?.length > 0;

  const permitTypes = ["AMENDMENT", "NEW"];

  const dispatch = useDispatch();

  const addAmendment = () => {
    dispatch(arrayPush(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizations.${code}.AMENDMENT`, {}));
  };

  const handleChangeAuthType = (value, _newVal, prevVal, _fieldName) => {
    console.log(value, _newVal, prevVal, _fieldName);

    permitTypes.forEach((type) => {
      if (value.includes(type) && !prevVal.includes(type)) {
        dispatch(arrayPush(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizations.${code}.${type}`, {}));
      } else if (!value.includes(type) && prevVal.includes(type)) {
        dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizations.${code}.${type}`, []));
      }
    });
  };

  return (
    <>
      <Field
        name={`${code}.types`}
        component={RenderGroupCheckbox}
        label="What type of authorization is involved in your application?"
        required
        validate={[required]}
        normalize={normalizeGroupCheckBox}
        onChange={handleChangeAuthType}
        options={[
          {
            disabled: hasAmendments,
            label: (
              <>
                Amendment to an existing authorization
                {hasAmendments && (
                  <Row
                    style={{ marginLeft: "-24px", marginRight: "-16px", cursor: "default" }}
                    gutter={[0, 16]}
                  >
                    <Col span={24}>
                      <FieldArray
                        name={`${code}.AMENDMENT`}
                        component={RenderEMAAmendFieldArray}
                        props={{}}
                      />
                    </Col>
                    <Button
                      onClick={addAmendment}
                      icon={<PlusCircleFilled />}
                      className="btn-sm-padding"
                    >
                      Add another amendment
                    </Button>
                  </Row>
                )}
              </>
            ),
            value: "AMENDMENT",
          },
          {
            label: "New",
            value: "NEW",
          },
        ]}
      />
      {hasNew && <RenderEMANewPermitSection code={code} />}
    </>
  );
};

const RenderAuthCodeFormSection = ({ authorizationType, code }) => {
  const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  if (authorizationType === "ENVIRONMENTAL_MANAGMENT_ACT") {
    // AMS authorizations, have options of amend/new with more details
    return <RenderEMAAuthCodeFormSection code={code} />;
  }
  // other authorizations, have single record so index with [0]
  return (
    <FormSection name={`${code}[0]`}>
      <Row>
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
        <Field
          name="existing_permits_authorizations"
          component={RenderField}
          label="If your application involved a change to an existing permit, please list the numbers of the permits involved."
          help="Please separate each permit with a comma"
        />
      </Row>
    </FormSection>
  );
};
export const AuthorizationsInvolved = () => {
  const dispatch = useDispatch();
  const transformedProjectSummaryAuthorizationTypes = useSelector(
    getTransformedProjectSummaryAuthorizationTypes
  );
  const amsAuthTypes = useSelector(getAmsAuthorizationTypes);
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));

  const handleChange = (e, code) => {
    if (e.target.checked) {
      const { project_summary_guid } = formValues;
      const formVal = [{ project_summary_guid, project_summary_authorization_type: code }];
      dispatch(arrayPush(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizationTypes`, code));
      if (amsAuthTypes.includes(code)) {
        console.log("now what");
      } else {
        dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizations[${code}]`, formVal));
      }
    } else {
      const index = formValues.authorizationTypes.indexOf(code);
      dispatch(arrayRemove(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizationTypes`, index));
    }
  };

  return (
    <FormSection name="authorizations">
      <Typography.Title level={3}>Purpose & Authorization</Typography.Title>
      <Alert
        description="Select the authorization that you anticipate needing for this project. This is to assist in planning and may not be the complete list for the final application."
        type="warning"
        showIcon
      />
      {/* <br />
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
      </Typography.Title> */}
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
          <div key={authorization.code}>
            <Typography.Title level={5}>{authorization.description}</Typography.Title>
            {authorization.children.map((child) => {
              const checked = formValues.authorizationTypes.includes(child.code);
              return (
                <div key={child.code}>
                  <Row gutter={[0, 16]}>
                    <Checkbox
                      value={child.code}
                      checked={checked}
                      onChange={(e) => handleChange(e, child.code)}
                    >
                      <b>{child.description}</b>
                    </Checkbox>
                    {checked && (
                      <>
                        {child.code === "MINES_ACT_PERMIT" && (
                          <Alert
                            message="You are submitting a Major Mine Application to the Chief Permitting Officer"
                            description={
                              <ul>
                                <li>
                                  For changes to existing activities, submit Notice of Departure
                                  through MineSpace.
                                </li>
                                <li>
                                  For exploration work outside the permit mine area without
                                  expanding the production area, submit a Notice of Work application
                                  via FrountCounter BC to amend your MX or CX permit.
                                </li>
                                <li>
                                  For induced polarization surveys or exploration drilling within
                                  the permit mine area, submit a Notification of Deemed
                                  Authorixation application via FrountCounter BC.
                                </li>
                              </ul>
                            }
                            type="info"
                            showIcon
                          />
                        )}
                        <RenderAuthCodeFormSection
                          code={child.code}
                          authorizationType={authorization.code}
                        />
                      </>
                    )}
                  </Row>
                </div>
              );
            })}
          </div>
        );
      })}
    </FormSection>
  );
};

export default AuthorizationsInvolved;
