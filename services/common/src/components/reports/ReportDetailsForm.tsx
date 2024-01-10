import { Alert, Col, Row, Typography } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, getFormValues, change } from "redux-form";

import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { ReportSubmissions } from "@mds/common/components/reports/ReportSubmissions";

import { FORM } from "@mds/common/constants/forms";
import { email, maxLength, required, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import ReportFilesTable from "./ReportFilesTable";
import {
  formatComplianceCodeValueOrLabel,
  createDropDownList,
  nullableStringSorter,
} from "@mds/common/redux/utils/helpers";
import RenderDate from "../forms/RenderDate";
import RenderSelect from "../forms/RenderSelect";
import FormWrapper from "../forms/FormWrapper";
import RenderField from "../forms/RenderField";
import { IMineReport } from "../..";
import RenderAutoSizeField from "../forms/RenderAutoSizeField";
import { BaseViewInput } from "../forms/BaseInput";

interface ReportDetailsFormProps {
  isEditMode?: boolean;
  mineGuid: string;
  formButtons: ReactNode;
  handleSubmit: (values) => void;
}

const ReportDetailsForm: FC<ReportDetailsFormProps> = ({
  isEditMode = true,
  mineGuid,
  formButtons,
  handleSubmit,
}) => {
  const dispatch = useDispatch();
  const formValues: IMineReport =
    useSelector((state) => getFormValues(FORM.VIEW_EDIT_REPORT)(state)) ?? {};
  const { mine_report_category = "", mine_report_definition_guid = "" } = formValues;

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
      <Typography.Title level={3}>Report Type</Typography.Title>

      <FormWrapper name={FORM.VIEW_EDIT_REPORT} onSubmit={handleSubmit} isEditMode={isEditMode}>
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
              <Typography.Paragraph>
                Select the report type and name to view the required codes.
              </Typography.Paragraph>
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
              placeholder="Include a precise and descriptive title to the report."
              component={RenderAutoSizeField}
              validate={[required, maxLength(500)]}
            />
          </Col>

          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3}>
              Report Information
            </Typography.Title>
            <Alert
              message=""
              description={<b>This type of report submission will be posted online publicly.</b>}
              type="warning"
              showIcon
            />
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
            {/*  TODO: "Your name is recorded for reference." */}
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
            {/*  TODO: "By providing your email, you agree to receive notification of the report" */}
          </Col>
          <Col span={24}>
            <Alert
              message=""
              description={
                <div>
                  <Row>
                    <Typography.Title level={5}>
                      Your mine manager will be notified of this submission
                    </Typography.Title>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <Typography.Text>Mine Manager</Typography.Text>
                      <Typography.Paragraph>Denise George</Typography.Paragraph>
                    </Col>
                    <Col span={12}>
                      <Typography.Text>Mine Manager Email</Typography.Text>
                      <Typography.Paragraph>Denise.George@gov.bc.ca</Typography.Paragraph>
                    </Col>
                    <Col span={24}>
                      <Typography.Text>
                        If this information is incorrect, please contact us.
                      </Typography.Text>
                    </Col>
                  </Row>
                </div>
              }
              type="info"
            />
          </Col>

          <Col span={24}>
            <Typography.Title className="margin-large--top" level={3}>
              Report File(s)
            </Typography.Title>
            {isEditMode && (
              <ReportSubmissions
                mineGuid={mineGuid}
                mineReportSubmissions={mineReportSubmissions}
                updateMineReportSubmissions={updateMineReportSubmissions}
              />
            )}
            <ReportFilesTable />
          </Col>
        </Row>
        {formButtons}
      </FormWrapper>
    </div>
  );
};

export default ReportDetailsForm;
