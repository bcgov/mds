import { Alert, Button, Col, Row, Typography } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { arrayPush, change, Field, FieldArray, getFormValues } from "redux-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/pro-light-svg-icons";

import {
  getDropdownPermitConditionCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import ReportFileUpload from "@mds/common/components/reports/ReportFileUpload";

import { FORM } from "@mds/common/constants/forms";
import {
  email,
  maxLength,
  required,
  yearNotInFuture,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import ReportFilesTable from "./ReportFilesTable";
import { formatComplianceCodeReportName } from "@mds/common/redux/utils/helpers";
import RenderDate from "../forms/RenderDate";
import RenderSelect from "../forms/RenderSelect";
import FormWrapper from "../forms/FormWrapper";
import RenderField from "../forms/RenderField";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import {
  IMineDocument,
  IMineReportDefinition,
  IMineReportSubmission,
  IParty,
  IPartyAppt,
  MINE_REPORTS_ENUM,
  MinePartyAppointmentTypeCodeEnum,
  REPORT_TYPE_CODES,
  SystemFlagEnum,
  REPORT_REGULATORY_AUTHORITY_CODES,
  REPORT_REGULATORY_AUTHORITY_ENUM,
  IMine,
  IEmliContact,
  MINE_REPORT_SUBMISSION_CODES,
} from "../..";
import RenderAutoSizeField from "../forms/RenderAutoSizeField";
import { BaseViewInput } from "../forms/BaseInput";
import {
  fetchPartyById,
  fetchPartyRelationships,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { getParties, getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import { uniqBy } from "lodash";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import ExportOutlined from "@ant-design/icons/ExportOutlined";
import { getPermitByGuid } from "@mds/common/redux/selectors/permitSelectors";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { RenderPRRFields } from "./ReportGetStarted";
import MinistryCommentPanel from "@mds/common/components/comments/MinistryCommentPanel";
import { getMineReportComments } from "@mds/common/redux/selectors//reportSelectors";
import {
  createMineReportComment,
  fetchMineReportComments,
} from "@mds/common/redux/actionCreators/reportCommentActionCreator";
import AuthorizationWrapper from "@mds/common/wrappers/AuthorizationWrapper";
import { USER_ROLES } from "@mds/common/constants/environment";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchEMLIContactsByRegion } from "@mds/common/redux/actionCreators/minespaceActionCreator";
import { getEMLIContactsByRegion } from "@mds/common/redux/selectors/minespaceSelector";
import { useParams } from "react-router-dom";

const RenderContacts: FC<any> = ({ fields, isEditMode, mineSpaceEdit, hasSubmissions }) => {
  const canEdit = isEditMode && (!mineSpaceEdit || !hasSubmissions);
  return (
    <div>
      {fields.map((contact, index) => (
        <Row key={contact.id} gutter={[16, 8]}>
          <Col span={24}>
            <Row gutter={16}>
              <Col>
                <Typography.Title level={5}>Report Contact #{index + 1}</Typography.Title>
              </Col>
              {canEdit && (
                <Col>
                  <Button
                    style={{ marginTop: 0 }}
                    className="fa-icon-container btn-sm-padding"
                    icon={<FontAwesomeIcon icon={faTrashAlt} />}
                    type="default"
                    onClick={() => fields.remove(index)}
                  >
                    Delete
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
          <Col span={12}>
            <Field
              name={`${contact}.name`}
              component={RenderField}
              label={`Contact Name`}
              placeholder="Enter name"
              disabled={!canEdit}
              required
              validate={[required]}
            />
          </Col>
          <Col span={12}>
            <Field
              name={`${contact}.email`}
              component={RenderField}
              label={`Contact Email`}
              disabled={!canEdit}
              required
              placeholder="Enter email"
              validate={[email, required]}
            />
          </Col>
        </Row>
      ))}
    </div>
  );
};

interface ReportDetailsFormProps {
  isEditMode?: boolean;
  initialValues?: Partial<IMineReportSubmission>;
  mineGuid: string;
  formButtons: ReactNode;
  handleSubmit: (values) => void;
}

const ReportDetailsForm: FC<ReportDetailsFormProps> = ({
  isEditMode = true,
  initialValues,
  mineGuid,
  formButtons,
  handleSubmit,
}) => {
  const { reportGuid } = useParams<{ reportGuid?: string }>();

  const coreEditReportPermission = USER_ROLES.role_edit_reports;
  const coreViewAllPermission = USER_ROLES.role_view;
  const dispatch = useDispatch();
  const formValues: IMineReportSubmission =
    useSelector((state) => getFormValues(FORM.VIEW_EDIT_REPORT)(state)) ?? {};
  const [mineManager, setMineManager] = useState<IParty>();
  const [mineManagerGuid, setMineManagerGuid] = useState<string>("");

  const {
    mine_report_category = "",
    mine_report_definition_guid = "",
    mine_report_submission_status_code,
    documents = [],
    report_type,
    permit_condition_category_code,
    permit_guid,
  } = formValues;

  const [selectedReportCode, setSelectedReportCode] = useState("");
  const [formattedMineReportDefinitionOptions, setFormatMineReportDefinitionOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const partyRelationships: IPartyAppt[] = useSelector((state) => getPartyRelationships(state));
  const parties = useSelector((state) => getParties(state));
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);
  const [mineReportDefinition, setMineReportDefinition] = useState<IMineReportDefinition>(null);

  const system = useSelector(getSystemFlag);
  const mine: IMine = useSelector((state) => getMineById(state, mineGuid));
  const EMLIContactsByRegion: IEmliContact[] = useSelector(getEMLIContactsByRegion);
  const [contactEmail, setContactEmail] = useState<string>();

  // PRR
  const permit = useSelector(getPermitByGuid(permit_guid));
  const dropdownPermitConditionCategoryOptions = useSelector(
    getDropdownPermitConditionCategoryOptions
  );
  const selectedPermitCategory =
    permit_condition_category_code &&
    dropdownPermitConditionCategoryOptions.find(
      (opt) => opt.value === permit_condition_category_code
    );

  const isCRR = report_type === REPORT_TYPE_CODES.CRR;
  const isPRR = report_type === REPORT_TYPE_CODES.PRR;
  const isMS = system === SystemFlagEnum.ms;

  const hasSubmissions = mine_report_submission_status_code !== MINE_REPORT_SUBMISSION_CODES.NON;
  // minespace users are only allowed to add documents
  const mineSpaceEdit = isMS && initialValues?.mine_report_guid && isEditMode;

  useEffect(() => {
    if (isMS && mine && EMLIContactsByRegion.length) {
      const contactCode = mine.major_mine_ind ? "MMO" : "ROE";
      const contact = EMLIContactsByRegion.find((c) => c.emli_contact_type_code === contactCode);
      setContactEmail(contact?.email);
    }
  }, [EMLIContactsByRegion, mine]);

  useEffect(() => {
    if (permit_guid && !permit) {
      dispatch(fetchPermits(mineGuid));
    }
    if (!partyRelationships.length) {
      // fetch all party relationships for the mine
      dispatch(fetchPartyRelationships({ mine_guid: mineGuid }));
    }
  }, [mineGuid]);

  useEffect(() => {
    if (mine?.mine_region) {
      dispatch(fetchEMLIContactsByRegion(mine.mine_region, mine.major_mine_ind));
    }
  }, [mine]);

  useEffect(() => {
    if (partyRelationships) {
      // Once the party relationships are fetched, find the mine manager
      const currentMineManager = partyRelationships.find(
        (relationship) =>
          relationship.mine_party_appt_type_code === MinePartyAppointmentTypeCodeEnum.MMG
      );
      if (currentMineManager) {
        // Since the party relationships don't contain the required party data, fetch the party
        setMineManagerGuid(currentMineManager.party_guid);
        dispatch(fetchPartyById(currentMineManager.party_guid));
      }
    }
  }, [partyRelationships]);

  useEffect(() => {
    if (parties) {
      // Once the mine manager is fetched, set the mine manager
      setMineManager(parties[mineManagerGuid]);
    }
  }, [parties]);

  useEffect(() => {
    // Format the mine report definition options for the search bar
    const newFormattedMineReportDefinitionOptions = mineReportDefinitionOptions
      .map((report) => {
        return {
          label: formatComplianceCodeReportName(report),
          value: report.mine_report_definition_guid,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    setFormatMineReportDefinitionOptions(uniqBy(newFormattedMineReportDefinitionOptions, "value"));
  }, [mineReportDefinitionOptions]);

  useEffect(() => {
    // update compliance article options when "Report Name" changes
    if (mine_report_definition_guid) {
      const newReportComplianceArticle = mineReportDefinitionOptions.find((opt) => {
        return opt.mine_report_definition_guid === mine_report_definition_guid;
      });
      setMineReportDefinition(newReportComplianceArticle);

      setSelectedReportCode(formatComplianceCodeReportName(newReportComplianceArticle));
    } else {
      setSelectedReportCode("");
    }
  }, [mine_report_definition_guid]);

  useEffect(() => {
    if (system === SystemFlagEnum.core) {
      const selection = mineReportDefinition?.compliance_articles[0]?.cim_or_cpo;
      dispatch(change(FORM.VIEW_EDIT_REPORT, "report_for", selection ?? "Not specified"));
    }
  }, [mineReportDefinition, !formValues?.report_for]);

  const updateDocuments = (docs: IMineDocument[]) => {
    dispatch(change(FORM.VIEW_EDIT_REPORT, "documents", docs));
  };

  const fetchComments = async () => {
    if (mineGuid && formValues.mine_report_guid) {
      setIsLoading(true);
      await dispatch(fetchMineReportComments(mineGuid, formValues.mine_report_guid));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [formValues.mine_report_guid]);

  const handleAddComment = async (values) => {
    const formVals = {
      report_comment: values.comment,
      comment_visibility_ind: values.visible,
    };
    await dispatch(createMineReportComment(mineGuid, formValues.mine_report_guid, formVals));
    fetchComments();
  };

  const notes = useSelector(getMineReportComments);

  const comments = notes
    .sort(
      (first, second) =>
        new Date(second.comment_datetime).getTime() - new Date(first.comment_datetime).getTime()
    )
    .map((comment) => ({
      content: comment.report_comment,
      timestamp: comment.comment_datetime,
      create_user: comment.comment_user,
      mine_report_comment_guid: comment.mine_report_comment_guid,
      mine_incident_note_guid: comment.report_comment,
    }));

  return (
    <div>
      {(isEditMode || !formValues.mine_report_guid) && isMS && (
        <>
          {isPRR && (
            <Alert
              message=""
              description={
                <b>
                  You are submitting a permit required report. If you intended to submit a code
                  required report, please go back and select it on the report type screen.
                </b>
              }
              type="warning"
              showIcon
            />
          )}
          <Alert
            message=""
            description={
              <b>
                If your report package relates to more than one Code requirement, please submit as
                separate report submissions.
              </b>
            }
            type="info"
            showIcon
            style={{ marginBottom: "32px" }}
          />
        </>
      )}

      <FormWrapper
        name={FORM.VIEW_EDIT_REPORT}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        reduxFormConfig={{ enableReinitialize: !!reportGuid }}
        initialValues={initialValues}
      >
        {!isMS && formButtons}
        <Row gutter={[16, 8]}>
          {!isMS && (
            <>
              <Col span={24}>
                <Typography.Title level={3} id="regulatory-authority">
                  Regulatory Authority
                </Typography.Title>

                <Field
                  name="report_for"
                  id="report_for"
                  required
                  disabled={true}
                  props={{
                    isVertical: true,
                  }}
                  label="Who is the report for?"
                  component={RenderRadioButtons}
                  validate={[requiredRadioButton]}
                  customOptions={[
                    {
                      label: REPORT_REGULATORY_AUTHORITY_ENUM.CPO,
                      value: REPORT_REGULATORY_AUTHORITY_CODES.CPO,
                    },
                    {
                      label: REPORT_REGULATORY_AUTHORITY_ENUM.CIM,
                      value: REPORT_REGULATORY_AUTHORITY_CODES.CIM,
                    },
                    {
                      label: REPORT_REGULATORY_AUTHORITY_CODES.BOTH,
                      value: REPORT_REGULATORY_AUTHORITY_CODES.BOTH,
                    },
                    {
                      label: REPORT_REGULATORY_AUTHORITY_CODES.NONE,
                      value: REPORT_REGULATORY_AUTHORITY_CODES.NONE,
                    },
                  ]}
                />
              </Col>
              <Col span={24}>
                <Typography.Title className="margin-large--top" level={3} id="report-type">
                  Report Type
                </Typography.Title>
              </Col>
              <Col span={24}>
                <Field
                  name="report_type"
                  id="report_type"
                  required
                  disabled={true}
                  props={{
                    isVertical: true,
                  }}
                  label="What is the type of the report?"
                  component={RenderRadioButtons}
                  validate={[requiredRadioButton]}
                  customOptions={[
                    { label: MINE_REPORTS_ENUM.CRR, value: REPORT_TYPE_CODES.CRR },
                    { label: MINE_REPORTS_ENUM.PRR, value: REPORT_TYPE_CODES.PRR },
                  ]}
                />
              </Col>
              {isPRR && <RenderPRRFields mineGuid={initialValues?.mine_guid} />}
              {isCRR && (
                <Col span={12}>
                  <Field
                    component={RenderSelect}
                    id="mine_report_definition_guid"
                    name="mine_report_definition_guid"
                    label="Report Name"
                    disabled={mineSpaceEdit}
                    props={{
                      data: formattedMineReportDefinitionOptions,
                    }}
                    required
                    placeholder={mine_report_category ? "Select" : "Select a report type"}
                    validate={[required]}
                  />
                </Col>
              )}
            </>
          )}
          {isMS && (
            <>
              <Col span={24}>
                <Typography.Title className="margin-large--top" level={3} id="report-type">
                  Report Type
                </Typography.Title>
              </Col>
              <Col md={12} sm={24}>
                <BaseViewInput
                  label="Report Type"
                  value={report_type && MINE_REPORTS_ENUM[report_type]}
                />
              </Col>
              {isPRR && (
                <Col md={12} sm={24}>
                  <BaseViewInput label="Permit Number" value={permit?.permit_no} />
                </Col>
              )}
              {selectedPermitCategory && (
                <Col md={12} sm={24}>
                  <BaseViewInput
                    label="Permit Condition Category"
                    value={selectedPermitCategory.label}
                  />
                </Col>
              )}
            </>
          )}

          {isMS && isCRR && (
            <>
              {selectedReportCode && (
                <Col span={12}>
                  <BaseViewInput label="Code Section / Report Name" value={selectedReportCode} />
                </Col>
              )}
              <Col span={24}>
                <div
                  className="grey-box"
                  style={{ backgroundColor: "#F2F2F2", padding: "16px 24px" }}
                >
                  <Row>
                    <Col xs={24} md={18}>
                      <Typography.Paragraph strong className="primary-colour">
                        You are submitting:
                      </Typography.Paragraph>
                      <Typography.Paragraph strong>{selectedReportCode}</Typography.Paragraph>
                      {mineReportDefinition?.compliance_articles[0]?.long_description && (
                        <Typography.Paragraph>
                          {mineReportDefinition.compliance_articles[0].long_description}
                        </Typography.Paragraph>
                      )}
                      {mineReportDefinition?.compliance_articles[0]?.help_reference_link && (
                        <Button
                          target="_blank"
                          rel="noopener noreferrer"
                          href={mineReportDefinition.compliance_articles[0].help_reference_link}
                          type="default"
                        >
                          More information <ExportOutlined />
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
              </Col>
            </>
          )}

          <Col span={24}>
            <Field
              id="description_comment"
              name="description_comment"
              label="Report Description"
              disabled={mineSpaceEdit && hasSubmissions}
              placeholder={`Example: "Mine X's Annual Reclamation Report, as per section 10.4.4. Spatial files included."`}
              props={{ maximumCharacters: 500, rows: 3 }}
              component={RenderAutoSizeField}
              validate={[maxLength(500)]}
              help="Briefly describe your report to clarify its purpose and scope for reviewers."
            />
          </Col>

          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3} id="report-information">
              Report Information
            </Typography.Title>
          </Col>

          <Col span={12}>
            <Field
              id="submission_year"
              name="submission_year"
              label="Report Compliance Year/Period"
              disabled={mineSpaceEdit}
              required
              placeholder="Select year"
              component={RenderDate}
              props={{
                yearMode: true,
                disabledDate: (currentDate) => currentDate.isAfter(),
              }}
              validate={[required, yearNotInFuture]}
            />
          </Col>
          <Col span={12}>
            <Field
              id="due_date"
              name="due_date"
              label="Due Date"
              placeholder="Select date"
              disabled={mineSpaceEdit}
              required={!isMS}
              component={RenderDate}
              validate={isMS ? [] : [required]}
            />
          </Col>

          <Col span={12}>
            <Field
              id="submitter_name"
              name="submitter_name"
              label="Submitter Name"
              placeholder="Enter name"
              disabled={mineSpaceEdit && hasSubmissions}
              required={isMS}
              component={RenderField}
              validate={isMS ? [required] : []}
              help="Your name is recorded for reference"
            />
          </Col>
          <Col span={12}>
            <Field
              id="submitter_email"
              name="submitter_email"
              label="Submitter Email"
              placeholder="Enter email"
              disabled={mineSpaceEdit && hasSubmissions}
              component={RenderField}
              required={isMS}
              validate={isMS ? [required, email] : [email]}
              help="This email will be used for notifications relating to this report"
            />
          </Col>
          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3} id="contact-information">
              Report Contact Information
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Typography.Paragraph>
              Report contacts will be notified of the submission and any status changes of this
              report.
            </Typography.Paragraph>
            {contactEmail && (
              <Typography.Paragraph>
                If the mine manager information is incorrect, please{" "}
                <a href={`mailto:${contactEmail}`}>contact us</a>.
              </Typography.Paragraph>
            )}
          </Col>
          <Col span={12}>
            <BaseViewInput label="Mine Manager" value={mineManager?.name ?? "-"} />
          </Col>
          <Col span={12}>
            <BaseViewInput label="Mine Manager Email" value={mineManager?.email ?? "-"} />
          </Col>
          <Col span={24}>
            <FieldArray
              name="mine_report_contacts"
              component={RenderContacts}
              props={{ isEditMode, mineSpaceEdit, hasSubmissions }}
            />
          </Col>
          <Col span={24}>
            {isEditMode && (!mineSpaceEdit || !hasSubmissions) && (
              <Button
                type="primary"
                className="btn-sm-padding"
                onClick={() =>
                  dispatch(arrayPush(FORM.VIEW_EDIT_REPORT, "mine_report_contacts", {}))
                }
              >
                + Add additional contact
              </Button>
            )}
          </Col>

          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3} id="documentation">
              Report File(s)
            </Typography.Title>
            {system === SystemFlagEnum.ms && (
              <Alert
                className="margin-large--bottom"
                message="This type of report submission may be posted online publicly."
                description="The Ministry publishes Regulatory Documents on its website for the purpose of research, public education,
                and to provide transparency in the administration of environmental laws. The permittee acknowledges that the Province may
                publish any Regulatory Document submitted by the permittee, excluding information that would be excepted from
                disclosure if the document was disclosed pursuant to a request under section 5 of the Freedom of Information and Protection
                of Privacy Act, and the permittee consents to such publication by the province."
                type="info"
                showIcon
              />
            )}
            {isEditMode && (
              <ReportFileUpload
                mineGuid={mineGuid}
                isProponent={system === SystemFlagEnum.ms}
                documents={documents ?? []}
                updateDocuments={updateDocuments}
              />
            )}
            {(hasSubmissions || documents) && <ReportFilesTable documents={documents} />}
          </Col>
          {system === SystemFlagEnum.core && (
            <AuthorizationWrapper permission={coreViewAllPermission} showToolTip={false}>
              <Col span={24}>
                <Typography.Title level={3} id="internal-ministry-comments">
                  Internal Ministry Comments
                </Typography.Title>
              </Col>
              <Col span={24}>
                <Typography.Paragraph>
                  <strong>
                    These comments are for internal staff only and will not be shown to proponents.
                  </strong>
                  &nbsp;Add comments to this report submission for future reference. Anything
                  written in these comments may be requested under FOIPPA. Keep it professional and
                  concise.
                </Typography.Paragraph>
                <MinistryCommentPanel
                  renderEditor={true}
                  onSubmit={handleAddComment}
                  loading={isLoading}
                  comments={comments?.map((comment) => ({
                    key: comment.mine_report_comment_guid,
                    author: comment.create_user,
                    content: comment.content,
                    actions: null,
                    datetime: comment.timestamp,
                  }))}
                  createPermission={coreEditReportPermission}
                />
              </Col>
            </AuthorizationWrapper>
          )}
        </Row>
        {formButtons}
      </FormWrapper>
    </div>
  );
};

export default ReportDetailsForm;
