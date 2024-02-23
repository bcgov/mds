import { Alert, Button, Col, Row, Typography } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { arrayPush, change, Field, FieldArray, getFormValues } from "redux-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/pro-light-svg-icons";

import { getMineReportDefinitionOptions } from "@mds/common/redux/selectors/staticContentSelectors";
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
  MinePartyAppointmentTypeCodeEnum,
  SystemFlagEnum,
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
import MinistryCommentPanel from "@mds/common/components/comments/MinistryCommentPanel";
import { getMineReportComments } from "@mds/common/redux/selectors//reportSelectors";
import {
  createMineReportComment,
  fetchMineReportComments,
} from "@mds/common/redux/actionCreators/reportCommentActionCreator";
import AuthorizationWrapper from "@mds/common/wrappers/AuthorizationWrapper";
import { USER_ROLES } from "@mds/common/constants/environment";

const RenderContacts: FC<any> = ({ fields, isEditMode, mineSpaceEdit }) => {
  const canEdit = isEditMode && !mineSpaceEdit;
  return (
    <div>
      {fields.map((contact, index) => (
        <Row key={contact.id} gutter={[16, 8]}>
          <Col span={24}>
            <Row>
              <Typography.Title level={5}>Report Contact #{index + 1}</Typography.Title>
              {canEdit && (
                <Button
                  style={{ marginTop: 0 }}
                  icon={<FontAwesomeIcon icon={faTrash} />}
                  type="text"
                  onClick={() => fields.remove(index)}
                />
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
  currentReportDefinition?: IMineReportDefinition;
}

const ReportDetailsForm: FC<ReportDetailsFormProps> = ({
  isEditMode = true,
  initialValues,
  mineGuid,
  formButtons,
  handleSubmit,
  currentReportDefinition,
}) => {
  const coreEditReportPermission = USER_ROLES.role_edit_reports;
  const coreViewAllPermission = USER_ROLES.role_view;
  const dispatch = useDispatch();
  const formValues: IMineReportSubmission =
    useSelector((state) => getFormValues(FORM.VIEW_EDIT_REPORT)(state)) ?? {};
  const [mineManager, setMineManager] = useState<IParty>();
  const [mineManagerGuid, setMineManagerGuid] = useState<string>("");
  const [selectedReportName, setSelectedReportName] = useState("");
  const {
    mine_report_category = "",
    mine_report_definition_guid = "",
    documents = [],
  } = formValues;
  const [selectedReportCode, setSelectedReportCode] = useState("");
  const [formattedMineReportDefinitionOptions, setFormatMineReportDefinitionOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const partyRelationships: IPartyAppt[] = useSelector((state) => getPartyRelationships(state));
  const parties = useSelector((state) => getParties(state));
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);
  const [mineReportDefinition, setMineReportDefinition] = useState<IMineReportDefinition>(null);

  const system = useSelector(getSystemFlag);

  // minespace users are only allowed to add documents
  const mineSpaceEdit =
    system === SystemFlagEnum.ms && initialValues?.mine_report_guid && isEditMode;

  useEffect(() => {
    if (!partyRelationships.length) {
      // fetch all party relationships for the mine
      dispatch(fetchPartyRelationships({ mine_guid: mineGuid }));
    }
  }, []);

  useEffect(() => {
    const reportType = initialValues?.permit_condition_category_code ? "PRR" : "CRR";
    dispatch(change(FORM.VIEW_EDIT_REPORT, "report_type", reportType));
  }, [!formValues?.report_type]);

  useEffect(() => {
    if (currentReportDefinition) {
      dispatch(
        change(
          FORM.VIEW_EDIT_REPORT,
          "mine_report_definition_guid",
          currentReportDefinition.mine_report_definition_guid
        )
      );
    }
  }, [currentReportDefinition]);

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
      const newReportName =
        formattedMineReportDefinitionOptions?.find(
          (opt) => opt.value === mine_report_definition_guid
        )?.label ?? "";
      setSelectedReportName(newReportName);

      const newReportComplianceArticle = mineReportDefinitionOptions.find((opt) => {
        return opt.mine_report_definition_guid === mine_report_definition_guid;
      });
      setMineReportDefinition(newReportComplianceArticle);

      setSelectedReportCode(formatComplianceCodeReportName(newReportComplianceArticle));
    } else {
      setSelectedReportName("");
      setSelectedReportCode("");
    }
  }, [mine_report_definition_guid]);

  const updateDocuments = (docs: IMineDocument[]) => {
    dispatch(change(FORM.VIEW_EDIT_REPORT, "documents", docs));
  };

  const fetchComments = async () => {
    setIsLoading(true);
    await dispatch(fetchMineReportComments(mineGuid, formValues.mine_report_guid));
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchComments();
    setIsLoading(true);
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
      {(isEditMode || !initialValues) && system !== SystemFlagEnum.core && (
        <Alert
          message=""
          description={
            <b>
              Please submit only one report package per permit section. If multiple sections are
              relevant, make separate submissions for each corresponding permit section.
            </b>
          }
          type="warning"
          showIcon
          style={{ marginBottom: "32px" }}
        />
      )}
      <Typography.Title level={3} id="report-type">
        Report Type
      </Typography.Title>

      <FormWrapper
        name={FORM.VIEW_EDIT_REPORT}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        initialValues={initialValues}
      >
        <Row gutter={[16, 8]}>
          {system === SystemFlagEnum.core && (
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
                  { label: "Code Required Report", value: "CRR" },
                  { label: "Permit Required Report", value: "PRR" },
                ]}
              />
            </Col>
          )}
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

          <Col span={24}>
            {selectedReportCode ? (
              <BaseViewInput label="Report Code Requirements" value={selectedReportCode} />
            ) : (
              isEditMode && (
                <Typography.Paragraph>
                  Select the report type and name to view the required codes.
                </Typography.Paragraph>
              )
            )}
          </Col>

          {system === SystemFlagEnum.ms && (
            <Col span={24}>
              <div
                className="grey-box"
                style={{ backgroundColor: "#F2F2F2", padding: "16px 24px" }}
              >
                <Row>
                  <Col xs={24} md={18}>
                    <b>You are submitting:</b>
                    <br />
                    <b>{selectedReportName}</b>
                    <br />
                    {mineReportDefinition && (
                      <>
                        <Typography.Paragraph>
                          {mineReportDefinition.compliance_articles[0].long_description}
                        </Typography.Paragraph>
                        <Button
                          target="_blank"
                          rel="noopener noreferrer"
                          href={mineReportDefinition.compliance_articles[0].help_reference_link}
                          type="default"
                        >
                          More information <ExportOutlined />
                        </Button>
                      </>
                    )}
                  </Col>
                </Row>
              </div>
            </Col>
          )}

          <Col span={24}>
            <Field
              id="description_comment"
              name="description_comment"
              label="Report Title and Additional Comment"
              disabled={mineSpaceEdit}
              required
              props={{ maximumCharacters: 500, rows: 3 }}
              component={RenderAutoSizeField}
              validate={[required, maxLength(500)]}
            />
            {isEditMode && (
              <Typography.Text className="report-instructions">
                Include a precise and descriptive title to the report.
              </Typography.Text>
            )}
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
              required
              component={RenderDate}
              validate={[required]}
            />
          </Col>

          <Col span={12}>
            <Field
              id="submitter_name"
              name="submitter_name"
              label="Submitter Name"
              placeholder="Enter name"
              disabled={mineSpaceEdit}
              required
              component={RenderField}
              validate={[required]}
              help="Your name is recorded for reference"
            />
          </Col>
          <Col span={12}>
            <Field
              id="submitter_email"
              name="submitter_email"
              label="Submitter Email"
              placeholder="Enter email"
              disabled={mineSpaceEdit}
              component={RenderField}
              validate={[email]}
              help="By providing your email, you agree to receive notification of the report"
            />
          </Col>
          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3} id="contact-information">
              Contact Information
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Typography.Paragraph>
              The mine manager and additional contacts provided will be notified regarding this
              report submission. If the mine manager information is incorrect, please contact your
              Records Technician or Mines Authorization Analyst
            </Typography.Paragraph>
          </Col>
          <Col span={12}>
            <Typography.Paragraph strong>Mine Manager</Typography.Paragraph>
            <Typography.Paragraph>{mineManager?.name ?? "-"}</Typography.Paragraph>
          </Col>
          <Col span={12}>
            <Typography.Paragraph strong>Mine Manager Email</Typography.Paragraph>
            <Typography.Paragraph>{mineManager?.email ?? "-"}</Typography.Paragraph>
          </Col>
          <Col span={24}>
            <FieldArray
              name="mine_report_contacts"
              component={RenderContacts}
              props={{ isEditMode, mineSpaceEdit }}
            />
          </Col>
          <Col span={24}>
            {isEditMode && !mineSpaceEdit && (
              <Button
                type="link"
                onClick={() =>
                  dispatch(arrayPush(FORM.VIEW_EDIT_REPORT, "mine_report_contacts", {}))
                }
              >
                + Add report contacts
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
                message=""
                description={<b>This type of report submission will be posted online publicly.</b>}
                type="warning"
                showIcon
              />
            )}
            {isEditMode && (
              <ReportFileUpload
                mineGuid={mineGuid}
                isProponent={system === SystemFlagEnum.ms}
                documents={documents}
                updateDocuments={updateDocuments}
              />
            )}
            <ReportFilesTable documents={documents} />
          </Col>

          <Col span={24}>
            <Typography.Title level={3} id="internal-ministry-comments">
              Internal Ministry Comments
            </Typography.Title>
          </Col>
          <Col span={24}>
            <AuthorizationWrapper permission={coreViewAllPermission}>
              <Typography.Paragraph>
                <strong>
                  These comments are for internal staff only and will not be shown to proponents.
                </strong>
                Add comments to this report submission for future reference. Anything written in
                these comments may be requested under FOIPPA. Keep it professional and concise.
              </Typography.Paragraph>
            </AuthorizationWrapper>
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
        </Row>
        {formButtons}
      </FormWrapper>
    </div>
  );
};

export default ReportDetailsForm;
