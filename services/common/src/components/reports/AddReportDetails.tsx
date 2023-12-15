import { Alert, Button, Col, Form, Input, List, Popconfirm, Row, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import { Link } from "react-router-dom";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import PropTypes from "prop-types";
import { ReportSubmissions } from "@mds/common/components/reports/ReportSubmissions";
import { compose } from "redux";
import { useDispatch, connect, useSelector } from "react-redux";
import { Field, reduxForm, formValueSelector } from "redux-form";
import * as FORM from "@mds/common/constants/forms";
import { dateNotInFuture, required, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@mds/common/components/common/config";
import { flatMap, uniqBy } from "lodash";
import Callout from "@mds/common/components/common/Callout";
import ReportsTable from "./ReportsTable";
import {
  resetForm,
  formatComplianceCodeValueOrLabel,
  createDropDownList,
  sortListObjectsByPropertyLocaleCompare,
} from "@mds/common/redux/utils/helpers";
import CustomPropTypes from "@mds/common/customPropTypes";
import moment from "moment";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";

import { getMineReports } from "@mds/common/redux/selectors/reportSelectors";
import {
  createMineReport,
  fetchMineReports,
  updateMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import { modalConfig } from "@mds/common/components/modalContent/config";
import TextArea from "antd/lib/input/TextArea";

const selector = formValueSelector(FORM.ADD_REPORT);

const updateMineReportDefinitionOptions = (
  mineReportDefinitionOptions,
  selectedMineReportCategory
) => {
  let mineReportDefnOptionsFiltered = mineReportDefinitionOptions;

  if (selectedMineReportCategory) {
    mineReportDefnOptionsFiltered = mineReportDefinitionOptions.filter(
      (rd) =>
        rd.categories.filter((c) => c.mine_report_category === selectedMineReportCategory).length >
        0
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
};

interface AddReportDetailsProps {
  mineGuid: string;
  updateMineReportSubmissions: any;
  mineReportSubmissions: any;
  showUploadedFiles: boolean;
  dropdownMineReportCategoryOptions: any;
  initialValues: any;
  mineReportDefinitionOptions: any;
  selectedMineReportCategory: any;
  selectedMineReportDefinition: any;
  updateDueDateWithDefaultDueDate: any;
}

const AddReportDetails: FC<AddReportDetailsProps> = (props) => {
  const { mineGuid, dropdownMineReportCategoryOptions } = props;

  const [mineReportDefinitionOptionsFiltered, setMineReportDefinitionOptionsFiltered] = useState([]);
  const [dropdownMineReportDefinitionOptionsFiltered, setDropdownMineReportDefinitionOptionsFiltered] = useState([]);
  const [selectedMineReportComplianceArticles, setSelectedMineReportComplianceArticles] = useState([]);
  const [mineReportSubmissions, setMineReportSubmissions] = useState([]);

  const [report, setReport] = useState(null);
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

      updateMineReportDefinitionOptions(
        props.mineReportDefinitionOptions,
        props.selectedMineReportCategory
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

  const handleEditReport = async (values) => {
    if (!values.mine_report_submissions || values.mine_report_submissions.length === 0) {
      useDispatch()(closeModal());
      return;
    }

    let payload: any = {
      mine_report_submissions: [
        ...values.mine_report_submissions,
        {
          documents:
            values.mine_report_submissions[values.mine_report_submissions.length - 1].documents,
        },
      ],
    };

    if (
      !report.received_date &&
      values.mine_report_submissions &&
      values.mine_report_submissions.length > 0
    ) {
      payload = { ...payload, received_date: moment().format("YYYY-MM-DD") };
    }
    await useDispatch()(updateMineReport(props.mineGuid, report.mine_report_guid, payload));
    await useDispatch()(closeModal());
    return useDispatch()(fetchMineReports(props.mineGuid));
  };

  const openEditReportModal = (event, report) => {
    event.preventDefault();
    setReport(report);
    useDispatch()(
      openModal({
        props: {
          onSubmit: handleEditReport,
          title: `Edit Report: ${report.report_name}`,
          mineGuid: props.mineGuid,
          width: "40vw",
          mineReport: report,
        },
        content: modalConfig.EDIT_REPORT,
      })
    );
  };

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
              id="mine_report_category"
              name="mine_report_category"
              label=""
              placeholder="Select"
              data={dropdownMineReportCategoryOptions}
              doNotPinDropdown
              component={renderConfig.SELECT}
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
              id="mine_report_definition_guid"
              name="mine_report_definition_guid"
              label=""
              placeholder={props.selectedMineReportCategory ? "Select" : "Select a category above"}
              data={dropdownMineReportDefinitionOptionsFiltered}
              doNotPinDropdown
              component={renderConfig.SELECT}
              validate={[required]}
              props={{ disabled: !props.selectedMineReportCategory }}
              onChange={(event, newValue) => {
                setReportName(newValue);
                // props.updateDueDateWithDefaultDueDate(event)
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
                component={renderConfig.YEAR}
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
                component={renderConfig.DATE}
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
            <Form.Item label="Report Title and Additional Comment">
              <Input.TextArea
                rows={3}
                placeholder="Include a concise and descriptive title to the report"
                style={{ borderWidth: "1px" }}
              />
              Include a concise and descriptive title to the report
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
            <ReportsTable
              openEditReportModal={openEditReportModal}
              mineReports={useSelector(getMineReports)}
              isLoaded={true}
            />
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
    formMeta: state.form[FORM.ADD_REPORT],
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddReportDetails as any) as any;

//LOAD the
