import { Alert, Col, Form, Input, Row, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";

import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { ReportSubmissions } from "@mds/common/components/reports/ReportSubmissions";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { FORM } from "@mds/common/constants/forms";
import {
  dateNotInFuture,
  required,
  yearNotInFuture,
  maxLength,
} from "@mds/common/redux/utils/Validate";
import { flatMap, uniqBy } from "lodash";
import ReportFilesTable from "./ReportFilesTable";
import {
  resetForm,
  formatComplianceCodeValueOrLabel,
  createDropDownList,
  sortListObjectsByPropertyLocaleCompare,
} from "@mds/common/redux/utils/helpers";
import moment from "moment";
import RenderDate from "../forms/RenderDate";
import RenderYear from "../forms/RenderYear";
import RenderSelect from "../forms/RenderSelect";
import RenderAutoSizeField from "../forms/RenderAutoSizeField";

const selector = formValueSelector(FORM.ADD_REPORT);

interface AddReportDetailsProps {
  mineGuid: string;
  dropdownMineReportCategoryOptions: any;
  initialValues: any;
  mineReportDefinitionOptions: any;
  selectedMineReportCategory: any;
  selectedMineReportDefinition: any;
}

const AddReportDetails: FC<AddReportDetailsProps> = (props) => {
  const { mineGuid, dropdownMineReportCategoryOptions } = props;

  const [mineReportDefinitionOptionsFiltered, setMineReportDefinitionOptionsFiltered] = useState(
    []
  );
  const [
    dropdownMineReportDefinitionOptionsFiltered,
    setDropdownMineReportDefinitionOptionsFiltered,
  ] = useState([]);
  const [selectedMineReportComplianceArticles, setSelectedMineReportComplianceArticles] = useState(
    []
  );
  const [mineReportSubmissions, setMineReportSubmissions] = useState([]);

  const [reportType, setReportType] = useState("");
  const [reportName, setReportName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedReportName, setSelectedReportName] = useState("");
  const [selectedReportCodes, setSelectedReportCodes] = useState([]);

  useEffect(() => {
    const updateOptions = () => {
      let mineReportDefnOptionsFiltered = props.mineReportDefinitionOptions;

      if (props.selectedMineReportCategory) {
        mineReportDefnOptionsFiltered = props.mineReportDefinitionOptions.filter(
          (rd) =>
            rd.categories.filter((c) => c.mine_report_category === props.selectedMineReportCategory)
              .length > 0
        );
      }

      let dropdownMineReportDefnOptionsFiltered = createDropDownList(
        mineReportDefnOptionsFiltered,
        "report_name",
        "mine_report_definition_guid"
      );
      dropdownMineReportDefnOptionsFiltered = sortListObjectsByPropertyLocaleCompare(
        dropdownMineReportDefnOptionsFiltered,
        "label"
      );

      setMineReportDefinitionOptionsFiltered(mineReportDefnOptionsFiltered);
      setDropdownMineReportDefinitionOptionsFiltered(dropdownMineReportDefnOptionsFiltered);

      if (props.selectedMineReportDefinition) {
        const selectedMineReportComplnceArticles = uniqBy(
          flatMap(
            mineReportDefinitionOptionsFiltered.filter(
              (x) => x.mine_report_definition_guid === props.selectedMineReportDefinition
            ),
            "compliance_articles"
          ),
          "compliance_article_id"
        );
        setSelectedMineReportComplianceArticles(selectedMineReportComplnceArticles);
      }
    };

    updateOptions();
  }, [
    props.mineReportDefinitionOptions,
    props.selectedMineReportCategory,
    props.selectedMineReportDefinition,
  ]);

  useEffect(() => {
    const category = dropdownMineReportCategoryOptions.find(
      (reportCategory) => reportCategory.value === reportType
    );
    if (category) {
      setSelectedCategory(category.label);
    }
  }, [reportType]);

  useEffect(() => {
    const name = dropdownMineReportDefinitionOptionsFiltered.find(
      (reportDefinitionOption) => reportDefinitionOption.value === reportName
    );
    if (name) {
      setSelectedReportName(name.label);
    }
  }, [reportName]);

  useEffect(() => {
    const selectedCodes = selectedMineReportComplianceArticles.map((opt) => {
      return formatComplianceCodeValueOrLabel(opt, true);
    });
    setSelectedReportCodes(selectedCodes);
  }, [selectedMineReportComplianceArticles]);

  const updateMineReportSubmissions = (updatedSubmissions) => {
    setMineReportSubmissions(updatedSubmissions);
  };

  return (
    <div>
      <Typography.Title level={4}>Report Type</Typography.Title>
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Form layout="vertical">
            <Typography.Text>* Report Type</Typography.Text>
            <Field
              component={RenderSelect}
              id="mine_report_category"
              name="mine_report_category"
              props={{
                label: "",
                data: dropdownMineReportCategoryOptions,
              }}
              placeholder="Select"
              validate={[required]}
              onChange={(event, newValue) => {
                setReportType(newValue);
              }}
              value={reportType}
            />
          </Form>
        </Col>

        <Col span={12}>
          <Form layout="vertical">
            <Typography.Text>* Report Name</Typography.Text>
            <Field
              key={"sdffd"}
              id="mine_report_definition_guid"
              name="mine_report_definition_guid"
              props={{
                label: "",
                data: dropdownMineReportDefinitionOptionsFiltered,
              }}
              placeholder={props.selectedMineReportCategory ? "Select" : "Select a category above"}
              component={RenderSelect}
              validate={[required]}
              onChange={(event, newValue) => {
                setReportName(newValue);
              }}
              value={reportName}
            />
          </Form>
        </Col>

        <Col span={24}>
          <Form.Item label="Report Code Requirements">
            {selectedMineReportComplianceArticles.length > 0 ? (
              <Form layout="vertical">
                {selectedReportCodes.map((code) => {
                  return (
                    <div key={code}>
                      <Typography.Text>{code}</Typography.Text>
                    </div>
                  );
                })}
              </Form>
            ) : (
              <Typography.Paragraph>
                Select the report type and name to view the required codes.
              </Typography.Paragraph>
            )}
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form layout="vertical">
            <Alert
              style={{ borderWidth: "1px" }}
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
          </Form>
        </Col>
        <Col span={24}>
          <Form layout="vertical">
            <Typography.Text>* Report Title and Additional Comment</Typography.Text>
            <Field
              id="description_comment"
              name="description_comment"
              component={RenderAutoSizeField}
              validate={[required, maxLength(500)]}
              maximumCharacters={500}
              placeholder="Include a concise and descriptive title to the report"
              style={{ borderWidth: "1px" }}
              rows={3}
            />
          </Form>
        </Col>

        <Typography.Title className="margin-large--top" level={4}>
          Report Information
        </Typography.Title>

        <Col span={24}>
          <Form layout="vertical">
            <Alert
              message=""
              description={
                <Row style={{ border: "none" }}>
                  <Col xs={24} md={18}>
                    <p>This type of report submission will be posted online publicly.</p>
                  </Col>
                </Row>
              }
              type="warning"
              showIcon
            />
          </Form>
        </Col>

        <Col span={12}>
          <Form layout="vertical">
            <Form.Item label="Report Compliance Year/Period*">
              <Field
                id="submission_year"
                name="submission_year"
                label=""
                component={RenderYear}
                validate={[required, yearNotInFuture]}
                disabledDate={(currentDate) => currentDate.year() > moment().year}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form layout="vertical">
            <Form.Item label="Due Date*">
              <Field
                id="due_date"
                name="due_date"
                label=""
                component={RenderDate}
                validate={[required, dateNotInFuture]}
                disabledDate={(currentDate) => currentDate.date() > moment().date}
              />
            </Form.Item>
          </Form>
        </Col>

        <Col span={12}>
          <Form layout="vertical">
            <Form.Item label="Submitter Name">
              <Input placeholder="Enter Name" style={{ borderWidth: "1px" }} />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form layout="vertical">
            <Form.Item label="Submitter Email">
              <Input placeholder="Enter Email" style={{ borderWidth: "1px" }} />
            </Form.Item>
          </Form>
        </Col>

        <Col span={24}>
          <Form layout="vertical">
            <Alert
              style={{ borderWidth: "1px" }}
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
          </Form>
        </Col>

        <Col span={24}>
          <Typography.Title className="margin-large--top" level={4}>
            Report File(s)
          </Typography.Title>
          <Form layout="vertical">
            <ReportSubmissions
              mineGuid={mineGuid}
              mineReportSubmissions={mineReportSubmissions}
              updateMineReportSubmissions={updateMineReportSubmissions}
            />
          </Form>
        </Col>

        <Col span={24}>
          <Form layout="vertical">
            <ReportFilesTable />
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default compose(
  connect((state) => ({
    dropdownMineReportCategoryOptions: getDropdownMineReportCategoryOptions(state),
    mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
    selectedMineReportCategory: selector(state, "mine_report_category"),
    selectedMineReportDefinition: selector(state, "mine_report_definition_guid"),
    formMeta: state[FORM.ADD_REPORT],
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddReportDetails as any) as any;
