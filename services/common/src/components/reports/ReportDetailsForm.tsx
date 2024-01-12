import { Alert, Button, Col, Row, Typography } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { arrayPush, change, Field, FieldArray, getFormValues } from "redux-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/pro-light-svg-icons";

import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { ReportSubmissions } from "@mds/common/components/reports/ReportSubmissions";

import { FORM } from "@mds/common/constants/forms";
import { email, maxLength, required, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import ReportFilesTable from "./ReportFilesTable";
import {
  createDropDownList,
  formatComplianceCodeValueOrLabel,
  nullableStringSorter,
} from "@mds/common/redux/utils/helpers";
import RenderDate from "../forms/RenderDate";
import RenderSelect from "../forms/RenderSelect";
import FormWrapper from "../forms/FormWrapper";
import RenderField from "../forms/RenderField";
import { IMineReport, IParty, IPartyAppt, MinePartyAppointmentTypeCodeEnum } from "../..";
import RenderAutoSizeField from "../forms/RenderAutoSizeField";
import { BaseViewInput } from "../forms/BaseInput";
import {
  fetchPartyById,
  fetchPartyRelationships,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { getParties, getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";

const RenderContacts: FC<any> = ({ fields }) => (
  <div>
    {fields.map((contact, index) => (
      <Row key={contact.id} gutter={[16, 8]}>
        <Col span={24}>
          <Row>
            <Typography.Title level={5}>Report Contact #{index + 1}</Typography.Title>
            <Button
              icon={<FontAwesomeIcon icon={faTrash} />}
              type="text"
              onClick={() => fields.remove(index)}
            />
          </Row>
        </Col>
        <Col span={12}>
          <Field
            name={`${contact}.name`}
            component={RenderField}
            label={`Contact Name`}
            placeholder="Enter name"
            required
            validate={[required]}
          />
        </Col>
        <Col span={12}>
          <Field
            name={`${contact}.email`}
            component={RenderField}
            label={`Contact Email`}
            required
            placeholder="Enter email"
            validate={[email, required]}
          />
        </Col>
      </Row>
    ))}
  </div>
);

interface ReportDetailsFormProps {
  isEditMode?: boolean;
  initialValues?: IMineReport;
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
  const dispatch = useDispatch();
  const formValues: IMineReport =
    useSelector((state) => getFormValues(FORM.VIEW_EDIT_REPORT)(state)) ?? {};
  const { mine_report_category = "", mine_report_definition_guid = "" } = formValues;
  const [mineManager, setMineManager] = useState<IParty>();
  const [mineManagerGuid, setMineManagerGuid] = useState<string>("");

  const partyRelationships: IPartyAppt[] = useSelector((state) => getPartyRelationships(state));
  const parties = useSelector((state) => getParties(state));

  useEffect(() => {
    if (!partyRelationships.length) {
      // fetch all party relationships for the mine
      dispatch(fetchPartyRelationships({ mine_guid: mineGuid }));
    }
  }, []);

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

  const [
    dropdownMineReportDefinitionOptionsFiltered,
    setDropdownMineReportDefinitionOptionsFiltered,
  ] = useState([]);

  const [mineReportSubmissions, setMineReportSubmissions] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedReportName, setSelectedReportName] = useState("");
  const [selectedReportCode, setSelectedReportCode] = useState("");

  const dropdownMineReportCategoryOptions = useSelector(getDropdownMineReportCategoryOptions);
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);

  useEffect(() => {
    // update "Report Name" options when "Report Type" changes
    const newCategory = dropdownMineReportCategoryOptions.find(
      (reportCategory) => reportCategory.value === mine_report_category
    );

    if (newCategory) {
      setSelectedCategory(newCategory.label);

      const newReportDefinitionOptionsFiltered = mineReportDefinitionOptions
        .filter((rd) => rd.categories.some((c) => c.mine_report_category === mine_report_category))
        .sort(nullableStringSorter);

      const newDropdownReportDefinitionOptions = createDropDownList(
        newReportDefinitionOptionsFiltered,
        "report_name",
        "mine_report_definition_guid"
      );
      setDropdownMineReportDefinitionOptionsFiltered(newDropdownReportDefinitionOptions);
    } else {
      setSelectedCategory("");
      setDropdownMineReportDefinitionOptionsFiltered([]);
      // KNOWN BUG IN ANTD: when the data options change in Select,
      // and there is no longer an option to match the value, Select does not update the label.
      // see: https://github.com/ant-design/ant-design/issues/21161
      // I attempted the "key" trick but this just shows the guid instead of label
      dispatch(change(FORM.VIEW_EDIT_REPORT, "mine_report_definition_guid", ""));
    }
  }, [mine_report_category]);

  useEffect(() => {
    // update compliance article options when "Report Name" changes
    if (mine_report_definition_guid) {
      const newReportName =
        dropdownMineReportDefinitionOptionsFiltered.find(
          (opt) => opt.value === mine_report_definition_guid
        )?.label ?? "";
      setSelectedReportName(newReportName);

      const newReportComplianceArticle = mineReportDefinitionOptions.find((opt) => {
        return opt.mine_report_definition_guid === mine_report_definition_guid;
      });

      const newSelectedCode = newReportComplianceArticle?.compliance_articles[0] ?? {};
      setSelectedReportCode(formatComplianceCodeValueOrLabel(newSelectedCode, true));
    } else {
      setSelectedReportName("");
      setSelectedReportCode("");
    }
  }, [mine_report_definition_guid]);

  const updateMineReportSubmissions = (updatedSubmissions) => {
    setMineReportSubmissions(updatedSubmissions);
  };

  return (
    <div>
      {!initialValues && (
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
      <Typography.Title level={3}>Report Type</Typography.Title>

      <FormWrapper
        name={FORM.VIEW_EDIT_REPORT}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        initialValues={initialValues}
      >
        <Row gutter={[16, 8]}>
          {/* TODO: this input is currently in the UI, and it controls the data for the next one
            but it is not intended to stay here! */}
          <Col span={12}>
            <Field
              component={RenderSelect}
              id="mine_report_category"
              name="mine_report_category"
              label="Report Type"
              props={{
                data: dropdownMineReportCategoryOptions,
              }}
              required
              placeholder="Select"
              validate={[required]}
            />
          </Col>

          <Col span={12}>
            <Field
              component={RenderSelect}
              id="mine_report_definition_guid"
              name="mine_report_definition_guid"
              label="Report Name"
              props={{
                data: dropdownMineReportDefinitionOptionsFiltered,
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

          <Col span={24}>
            <div className="grey-box" style={{ backgroundColor: "#F2F2F2", padding: "16px 24px" }}>
              <Row>
                <Col xs={24} md={18}>
                  <b>You are submitting:</b>
                  <br />
                  <b>{selectedCategory}</b> [TODO: plain language on what it is]
                  <br />
                  <b>{selectedReportName}</b> [TODO: plain language on what it is]
                  <br />
                  <b>{selectedReportCode}</b> [TODO: plain language on what it is]
                </Col>
              </Row>
            </div>
          </Col>

          <Col span={24}>
            <Field
              id="description_comment"
              name="description_comment"
              label="Report Title and Additional Comment"
              required
              props={{ maximumCharacters: 500, rows: 3 }}
              component={RenderAutoSizeField}
              validate={[required, maxLength(500)]}
            />
            <Typography.Text className="report-instructions">
              Include a precise and descriptive title to the report.
            </Typography.Text>
          </Col>

          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3}>
              Report Information
            </Typography.Title>
          </Col>

          <Col span={12}>
            <Field
              id="submission_year"
              name="submission_year"
              label="Report Compliance Year/Period"
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
              required
              component={RenderField}
              validate={[required]}
            />
            {isEditMode && (
              <Typography.Text className="report-instructions">
                Your name is recorded for reference
              </Typography.Text>
            )}
          </Col>
          <Col span={12}>
            <Field
              id="submitter_email"
              name="submitter_email"
              label="Submitter Email"
              placeholder="Enter email"
              component={RenderField}
              validate={[email]}
            />
            {isEditMode && (
              <Typography.Text className="report-instructions">
                By providing your email, you agree to receive notification of the report
              </Typography.Text>
            )}
          </Col>
          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3}>
              Contact Information
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Typography.Paragraph>
              The mine manager and additional contacts provided will be notified regarding this
              report submission. If the mine manager information is incorrect, please{" "}
              <a href={""}>contact us</a>.
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
            <FieldArray name="contacts" component={RenderContacts} />
          </Col>
          <Col span={24}>
            <Button
              type="link"
              onClick={() => dispatch(arrayPush(FORM.VIEW_EDIT_REPORT, "contacts", {}))}
            >
              + Add report contacts
            </Button>
          </Col>

          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3}>
              Report File(s)
            </Typography.Title>
            <Alert
              message=""
              description={<b>This type of report submission will be posted online publicly.</b>}
              type="warning"
              showIcon
            />
            {isEditMode && (
              <ReportSubmissions
                mineGuid={mineGuid}
                mineReportSubmissions={mineReportSubmissions}
                updateMineReportSubmissions={updateMineReportSubmissions}
              />
            )}
            <ReportFilesTable report={initialValues} />
          </Col>
        </Row>
        {formButtons}
      </FormWrapper>
    </div>
  );
};

export default ReportDetailsForm;
