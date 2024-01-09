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
import {
  dateNotInFuture,
  email,
  maxLength,
  required,
  yearNotInFuture,
} from "@mds/common/redux/utils/Validate";
import { flatMap, uniqBy } from "lodash";
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
  const [selectedReportCodes, setSelectedReportCodes] = useState([]);

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

      const newReportComplianceArticles = uniqBy(
        flatMap(
          mineReportDefinitionOptions.filter(
            (opt) => opt.mine_report_definition_guid === mine_report_definition_guid
          ),
          "compliance_articles"
        ),
        "compliance_article_id"
      );

      const newSelectedCodeOptions = newReportComplianceArticles.map((opt) => {
        return formatComplianceCodeValueOrLabel(opt, true);
      });
      setSelectedReportCodes(newSelectedCodeOptions);
    } else {
      setSelectedReportName("");
      setSelectedReportCodes([]);
    }
  }, [mine_report_definition_guid]);

  const updateMineReportSubmissions = (updatedSubmissions) => {
    setMineReportSubmissions(updatedSubmissions);
  };

  return (
    <div>
      <Typography.Title level={3}>Report Type</Typography.Title>
      <FormWrapper name={FORM.VIEW_EDIT_REPORT} onSubmit={handleSubmit} isEditMode={isEditMode}>
        <Row gutter={[16, 8]}>
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
            {selectedReportCodes.length > 0 ? (
              <>
                {selectedReportCodes.map((code) => {
                  return (
                    <div key={code}>
                      <Typography.Text>{code}</Typography.Text>
                    </div>
                  );
                })}
              </>
            ) : (
              <Typography.Paragraph>
                Select the report type and name to view the required codes.
              </Typography.Paragraph>
            )}
          </Col>

          <Col span={24}>
            <Alert
              message=""
              description={
                <Row>
                  <Col xs={24} md={18}>
                    <p>
                      <b>You are submitting:</b>
                      <br />
                      {selectedCategory} [TODO: plain language on what it is]
                      <br />
                      {selectedReportName} [TODO: plain language on what it is]
                      <br />
                      {selectedReportCodes.length ? selectedReportCodes[0] : ""} [TODO: plain
                      language on what it is]
                      <br />
                    </p>
                  </Col>
                </Row>
              }
              type="info"
            />
          </Col>

          <Typography.Title className="margin-large--top" level={3}>
            Report Information
          </Typography.Title>

          <Col span={24}>
            <Alert
              message=""
              description={
                <Row>
                  <Col xs={24} md={18}>
                    <p>This type of report submission will be posted online publicly.</p>
                  </Col>
                </Row>
              }
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
              validate={[required, dateNotInFuture]}
              disabledDate={(currentDate) => currentDate.isAfter()}
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
