import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  arrayPush,
  arrayRemove,
  change,
  Field,
  FieldArray,
  FormSection,
  getFormValues,
} from "redux-form";
import { Alert, Button, Checkbox, Col, Row, Tooltip, Typography } from "antd";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import {
  getDropdownProjectSummaryPermitTypes,
  getProjectSummaryDocumentTypesHash,
  getTransformedProjectSummaryAuthorizationTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getAmsAuthorizationTypes } from "@mds/common/redux/selectors/projectSelectors";
import {
  digitCharactersOnly,
  minLength,
  maxLength,
  required,
  requiredList,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderGroupCheckbox, {
  normalizeGroupCheckBox,
} from "@mds/common/components/forms/RenderGroupCheckbox";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { createDropDownList } from "@mds/common/redux/utils/helpers";
import { FORM } from "@mds/common/constants/forms";
import RenderHiddenField from "../forms/RenderHiddenField";
import AuthorizationSupportDocumentUpload from "./AuthorizationSupportDocumentUpload";
import { IProjectSummaryDocument } from "@mds/common/interfaces";
import {
  renderTextColumn,
  renderDateColumn,
  renderCategoryColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { Link } from "react-router-dom";
import {
  PROJECT_SUMMARY_DOCUMENT_TYPE_CODE_STATE,
  PROJECT_SUMMARY_DOCUMENT_TYPE_CODE,
} from "../..";

const RenderEMAPermitCommonSections = ({ code, isAmendment, index }) => {
  const dispatch = useDispatch();
  const purposeLabel = isAmendment
    ? "Additional Amendment Request Information"
    : "Purpose of Application";
  const authType = isAmendment ? "AMENDMENT" : "NEW";
  const { authorizations, mine_guid, project_guid, project_summary_guid } = useSelector(
    getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)
  );
  const codeAuthorizations = authorizations[code];
  const { AMENDMENT, NEW } = codeAuthorizations;
  const sectionValues = isAmendment ? AMENDMENT[index] : NEW[index];
  const [showExemptionSection, setshowExemptionSection] = useState(
    sectionValues?.exemption_requested || false
  );

  const projectSummaryDocumentTypesHash = useSelector(getProjectSummaryDocumentTypesHash);

  const onChange = (value, _newVal, _prevVal, _fieldName) => {
    setshowExemptionSection(value);
  };

  const isDocumentTypeRequired = (type) => {
    let valuesToCheckFor = [];
    if (type === "DFA") {
      valuesToCheckFor = ["ILT", "IGT", "DDL"];
    } else if (type === "CSL") {
      valuesToCheckFor = ["TRA"];
    } else if (type === "CON") {
      valuesToCheckFor = ["TRA", "NAM"];
    } else if (type === "CAF") {
      valuesToCheckFor = ["MMR", "RCH"];
    }

    return sectionValues?.amendment_changes?.some((val) => valuesToCheckFor.includes(val));
  };

  const removeAmendmentDocument = (
    amendmentDocumentsIndex: number,
    category: string,
    document_manager_guid: string
  ) => {
    const categorySpecificDocumentType = PROJECT_SUMMARY_DOCUMENT_TYPE_CODE_STATE[category];
    const categorySpecificDocuments = sectionValues[categorySpecificDocumentType];
    const categorySpecificDocumentIndex = categorySpecificDocuments.findIndex(
      (doc) => document_manager_guid === doc.document_manager_guid
    );

    dispatch(
      arrayRemove(
        FORM.ADD_EDIT_PROJECT_SUMMARY,
        `authorizations.[${code}].${authType}[${index}].${categorySpecificDocumentType}`,
        categorySpecificDocumentIndex
      )
    );

    dispatch(
      arrayRemove(
        FORM.ADD_EDIT_PROJECT_SUMMARY,
        `authorizations.[${code}].${authType}[${index}].amendment_documents`,
        amendmentDocumentsIndex
      )
    );
  };

  const updateAmendmentDocuments = (document: IProjectSummaryDocument) => {
    const category = document.category || document.project_summary_document_type_code;

    dispatch(
      arrayPush(
        FORM.ADD_EDIT_PROJECT_SUMMARY,
        `authorizations.[${code}].${authType}[${index}].${PROJECT_SUMMARY_DOCUMENT_TYPE_CODE_STATE[category]}`,
        document
      )
    );

    dispatch(
      arrayPush(
        FORM.ADD_EDIT_PROJECT_SUMMARY,
        `authorizations.[${code}].${authType}[${index}].amendment_documents`,
        document
      )
    );
  };

  const tableDocuments =
    sectionValues?.amendment_documents?.map(
      (doc) =>
        new MineDocument({
          ...doc,
          category: doc.project_summary_document_type_code || doc.category,
        })
    ) ?? [];

  const documentColumns = [
    renderTextColumn("document_name", "File Name"),
    renderCategoryColumn(
      "category",
      "Document Category",
      projectSummaryDocumentTypesHash,
      false,
      "N/A"
    ),
    renderDateColumn("upload_date", "Updated"),
    renderTextColumn("create_user", "Updated By"),
  ];

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
      {showExemptionSection && (
        <div>
          <Field
            label="State the reason of exemption"
            name="exemption_reason"
            required
            validate={[required, maxLength(4000)]}
            maximumCharacters={4000}
            minRows={2}
            component={RenderAutoSizeField}
          />
          <Alert
            description={
              <>
                If yes, please attach a <b>letter with rationale</b> to support this exemption at{" "}
                <b>Document Upload</b> section. Please note that requests may not always be granted.
                Incomplete applications may be returned if they don&apos;t meet Ministry
                requirements and the application fee may not be refunded.
              </>
            }
            showIcon
          />
        </div>
      )}
      <div className="margin-large--bottom">
        <Typography.Title level={5} className="margin-large--top">
          Upload Documents
        </Typography.Title>
        <Typography.Text>
          {" "}
          Submit the documents required for your amendment application.
        </Typography.Text>
      </div>
      <AuthorizationSupportDocumentUpload
        code={code}
        mineGuid={mine_guid}
        documents={tableDocuments}
        updateAmendmentDocuments={updateAmendmentDocuments}
        removeAmendmentDocument={removeAmendmentDocument}
        projectGuid={project_guid}
        projectSummaryGuid={project_summary_guid}
        dfaRequired={isDocumentTypeRequired(
          PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.DISCHARGE_FACTOR_AMENDMENT
        )}
        cslRequired={isDocumentTypeRequired(PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CONSENT_LETTER)}
        conRequired={isDocumentTypeRequired(
          PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CHANGE_OF_OWNERSHIP_NAME_OR_ADDRESS_FORM
        )}
        cafRequired={isDocumentTypeRequired(
          PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CLAUSE_AMENDMENT_FORM
        )}
        showExemptionSection={showExemptionSection}
        isAmendment={isAmendment}
      />
      <DocumentTable
        documents={tableDocuments}
        documentParent="project summary authorization"
        documentColumns={documentColumns}
      />
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
        <RenderEMAPermitCommonSections isAmendment={false} code={code} index={0} />
      </FormSection>
    </div>
  );
};

const RenderEMAAmendFieldArray = ({ fields, code }) => {
  const handleRemoveAmendment = (index: number) => {
    fields.remove(index);
  };

  return (
    <>
      {fields.map((amendment: string, index) => (
        <Col className="grey-box" key={amendment}>
          <FormSection name={amendment}>
            <Field
              label={
                <Row justify="space-between" style={{ flexBasis: "100%" }}>
                  <Col>
                    <Typography.Text>
                      Authorization Number &nbsp;&nbsp;&nbsp;
                      <a
                        href="https://j200.gov.bc.ca/pub/ams/Default.aspx?PossePresentation=DocumentSearch"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        AMS Lookup
                      </a>
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Button onClick={() => handleRemoveAmendment(index)}>Cancel</Button>
                  </Col>
                </Row>
              }
              name="existing_permits_authorizations[0]"
              required
              validate={[required, minLength(2), maxLength(6), digitCharactersOnly]}
              help="Number only (e.g. PC12345 should be entered as 12345)"
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
            <RenderEMAPermitCommonSections isAmendment={true} code={code} index={index} />
          </FormSection>
        </Col>
      ))}
    </>
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
        required
        validate={[requiredList]}
        normalize={normalizeGroupCheckBox}
        onDrop={(event) => {
          event.preventDefault();
        }}
        onChange={handleChangeAuthType}
        props={{
          label: "What type of authorization is involved in your application?",
          options: [
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
                      <FieldArray
                        name={`${code}.AMENDMENT`}
                        component={RenderEMAAmendFieldArray}
                        props={{ code }}
                      />
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
          ],
        }}
      />
      {hasNew && <RenderEMANewPermitSection code={code} />}
    </>
  );
};

const RenderMinesActPermitSelect = () => {
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { mine_guid } = formValues;
  const permits = useSelector(getPermits);
  const permitDropdown = createDropDownList(permits, "permit_no", "permit_guid");
  const permitMineGuid = permits[0]?.mine_guid;
  const [loaded, setLoaded] = useState(permits.length > 0 && permitMineGuid === mine_guid);

  useEffect(() => {
    if (mine_guid && (!loaded || permitMineGuid !== mine_guid)) {
      setLoaded(false);
      dispatch(fetchPermits(mine_guid)).then(() => {
        setLoaded(true);
      });
    }
  }, [mine_guid]);

  return (
    <Field
      name="existing_permits_authorizations"
      component={RenderMultiSelect}
      data={permitDropdown}
      loading={!loaded}
      label="If your application involved a change to an existing permit, please list the permits involved."
    />
  );
};

const RenderAuthCodeFormSection = ({ authorizationType, code }) => {
  const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  if (authorizationType === "ENVIRONMENTAL_MANAGMENT_ACT") {
    // AMS authorizations, have options of amend/new with more details
    return <RenderEMAAuthCodeFormSection code={code} />;
  }
  if (authorizationType === "OTHER_LEGISLATION") {
    return (
      <FormSection name={`${code}[0]`}>
        <Row>
          <Field
            name="authorization_description"
            label="If the legislation you're seeking isn't listed, please provide the details here"
            maximumCharacters={100}
            required
            validate={[required, maxLength(100)]}
            component={RenderAutoSizeField}
          />
        </Row>
      </FormSection>
    );
  }
  const isMinesAct = authorizationType === "MINES_ACT";

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
          validate={[requiredList]}
          normalize={normalizeGroupCheckBox}
        />
        {isMinesAct ? (
          <RenderMinesActPermitSelect />
        ) : (
          <Field
            name="existing_permits_authorizations"
            normalize={(val) => val.split(",").map((v) => v.trim())}
            component={RenderField}
            label="If your application involved a change to an existing permit, please list the numbers of the permits involved."
            help="Please separate each permit with a comma"
          />
        )}
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
      let formVal;
      dispatch(arrayPush(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizationTypes`, code));
      if (amsAuthTypes.includes(code)) {
        formVal = { AMENDMENT: [], NEW: [], types: [] };
      } else if (code === "OTHER") {
        formVal = [
          { project_summary_authorization_type: code, project_summary_permit_type: ["OTHER"] },
        ];
      } else {
        formVal = [{ project_summary_authorization_type: code }];
      }
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizations[${code}]`, formVal));
    } else {
      const index = formValues.authorizationTypes.indexOf(code);
      dispatch(arrayRemove(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizationTypes`, index));
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, `authorizations[${code}]`, null));
    }
  };

  return (
    <div id="authorizations-involved">
      <Row gutter={[0, 16]}>
        <Typography.Title level={3}>Purpose and Authorization</Typography.Title>
        <Alert
          description="Select the authorization that you anticipate needing for this project. This is to assist in planning and may not be the complete list for the final application."
          type="warning"
          showIcon
        />
        <Field
          name="authorizationTypes"
          component={RenderHiddenField}
          required
          validate={[requiredList]}
          label={<Typography.Title level={4}>Regulatory Approval Type</Typography.Title>}
        >
          <FormSection name="authorizations">
            {transformedProjectSummaryAuthorizationTypes.map((authorization) => {
              return (
                <div key={authorization.code}>
                  <Typography.Title level={5}>{authorization.description}</Typography.Title>
                  {authorization.children.map((child) => {
                    const checked = formValues.authorizationTypes?.includes(child.code);
                    return (
                      <div key={child.code}>
                        <Row gutter={[0, 16]}>
                          <Col>
                            <Checkbox
                              data-cy={`checkbox-authorization-${child.code}`}
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
                                          For intent to depart from a Mines Act authorized mine plan
                                          and reclamation program, as per HSRC code 10.1.18, submit
                                          a{" "}
                                          <Link
                                            to={GLOBAL_ROUTES?.MINE_DASHBOARD.dynamicRoute(
                                              formValues?.mine_guid,
                                              "nods"
                                            )}
                                          >
                                            Notice of Departure
                                          </Link>{" "}
                                          through MineSpace
                                        </li>
                                        <li>
                                          For exploration work outside the permit mine area without
                                          expanding the production area, submit a Notice of Work
                                          application via FrontCounter BC to amend your MX or CX
                                          permit.
                                        </li>
                                        <li>
                                          For induced polarization surveys or exploration drilling
                                          within the permit mine area, submit a Notification of
                                          Deemed Authorization application via FrontCounter BC.
                                        </li>
                                      </ul>
                                    }
                                    type="info"
                                    showIcon
                                  />
                                )}
                                <RenderAuthCodeFormSection
                                  code={child?.code}
                                  authorizationType={authorization?.code}
                                />
                              </>
                            )}
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </FormSection>
        </Field>
      </Row>
    </div>
  );
};

export default AuthorizationsInvolved;
