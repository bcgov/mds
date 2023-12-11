import { Alert, Button, Col, Form, Input, List, Popconfirm, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import { Link } from "react-router-dom";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import PropTypes from "prop-types";
import ReportSubmissions from "@mds/common/components/reports/ReportSubmissions";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, formValueSelector } from "redux-form";
import * as FORM from "@mds/common/constants/forms";
import { required, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@mds/common/components/common/config";
import { flatMap, uniqBy } from "lodash";
import Callout from "@mds/common/components/common/Callout";
import {
  resetForm,
  formatComplianceCodeValueOrLabel,
  createDropDownList,
  sortListObjectsByPropertyLocaleCompare } from "@mds/common/redux/utils/helpers";
import CustomPropTypes from "@mds/common/customPropTypes";
import moment from "moment";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  updateMineReportSubmissions: PropTypes.func.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  showUploadedFiles: PropTypes.bool,
  dropdownMineReportCategoryOptions: PropTypes.arrayOf(
    PropTypes.objectOf(CustomPropTypes.dropdownListItem)
  ).isRequired,
};

const selector = formValueSelector(FORM.ADD_REPORT);

const updateMineReportDefinitionOptions = (mineReportDefinitionOptions, selectedMineReportCategory) => {
  let mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions;

  if (selectedMineReportCategory) {
    mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions.filter(
      (rd) =>
        rd.categories.filter((c) => c.mine_report_category === selectedMineReportCategory)
          .length > 0
    );
  }

  let dropdownMineReportDefinitionOptionsFiltered = createDropDownList(
    mineReportDefinitionOptionsFiltered,
    "report_name",
    "mine_report_definition_guid"
  );
  dropdownMineReportDefinitionOptionsFiltered = sortListObjectsByPropertyLocaleCompare(
    dropdownMineReportDefinitionOptionsFiltered,
    "label"
  );
};


// const AddReportDetails = ({mineGuid}) => {
const AddReportDetails = (props) => {
    const { mineGuid, dropdownMineReportCategoryOptions } = props;
    const [state, setState] = useState({
      existingReport: Boolean(!props.initialValues?.mine_report_definition_guid),
      mineReportDefinitionOptionsFiltered: [],
      dropdownMineReportDefinitionOptionsFiltered: [],
      selectedMineReportComplianceArticles: [],
      mineReportSubmissions: props.initialValues?.mine_report_submissions || [], // Provide a default value
    });

    useEffect(() => {
      const updateOptions = () => {
        let mineReportDefinitionOptionsFiltered = props.mineReportDefinitionOptions;
  
        if (props.selectedMineReportCategory) {
          mineReportDefinitionOptionsFiltered = props.mineReportDefinitionOptions.filter(
            (rd) =>
              rd.categories.filter(
                (c) => c.mine_report_category === props.selectedMineReportCategory
              ).length > 0
          );
        }
  
        let dropdownMineReportDefinitionOptionsFiltered = createDropDownList(
          mineReportDefinitionOptionsFiltered,
          'report_name',
          'mine_report_definition_guid'
        );
        dropdownMineReportDefinitionOptionsFiltered = sortListObjectsByPropertyLocaleCompare(
          dropdownMineReportDefinitionOptionsFiltered,
          'label'
        );
  
        setState((prev) => ({
          ...prev,
          mineReportDefinitionOptionsFiltered,
          dropdownMineReportDefinitionOptionsFiltered,
        }));
  
        // Update selectedMineReportComplianceArticles when mineReportDefinitionOptionsFiltered changes
        if (props.selectedMineReportDefinition) {
          const selectedMineReportComplianceArticles = uniqBy(
            flatMap(
              mineReportDefinitionOptionsFiltered.filter(
                (x) => x.mine_report_definition_guid === props.selectedMineReportDefinition
              ),
              'compliance_articles'
            ),
            'compliance_article_id'
          );
  
          setState((prev) => ({
            ...prev,
            selectedMineReportComplianceArticles,
          }));
        }
      };
  
      updateOptions();
    }, [props.mineReportDefinitionOptions, props.selectedMineReportCategory, props.selectedMineReportDefinition]);
  
  return (
    <div>
      <Typography.Title level={4}>Report Type</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Field
            id="mine_report_category"
            name="mine_report_category"
            label="Report Type*"
            placeholder="Select"
            data={props.dropdownMineReportCategoryOptions}
            doNotPinDropdown
            component={renderConfig.SELECT}
            validate={[required]}
          />
        </Col>
        <Col span={12}>
          <Field
            id="mine_report_definition_guid"
            name="mine_report_definition_guid"
            label="Report Name*"
            placeholder={props.selectedMineReportCategory ? "Select" : "Select a category above"}
            data={state.dropdownMineReportDefinitionOptionsFiltered}
            doNotPinDropdown
            component={renderConfig.SELECT}
            validate={[required]}
            onChange={props.updateDueDateWithDefaultDueDate}
            props={{ disabled: !props.selectedMineReportCategory }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item label="Report Code Requirements">
            {state.selectedMineReportComplianceArticles.length > 0 ? (
              // <List bordered size="small" className="color-primary">
              <List>
                {state.selectedMineReportComplianceArticles.map((opt) => (
                  <div>
                    {/* <List.Item key={opt}>{formatComplianceCodeValueOrLabel(opt, true)}</List.Item> */}
                    <Typography.Paragraph>
                      {formatComplianceCodeValueOrLabel(opt, true)}
                    </Typography.Paragraph>
                  </div>
                ))}
              </List>
            ) : (
              <Typography.Paragraph>
                Select the report type and name to view the required codes.
              </Typography.Paragraph>
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]} >
        <Col span={24}>
        <Alert style={{ borderWidth: '1px' }}
          message=""
          description={
            <Row>
              <Col xs={24} md={18}>
                <p>
                  <b>You are submitting:</b><br/>
                  Category<br/>
                  Definition<br/>
                  Number<br/>
                </p>
              </Col>
            </Row>
          }
          type="info"
        />
        </Col>
      </Row>
      <Row>
        <Typography.Title level={4}>Report Information</Typography.Title>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
        <Alert
          message=""
          description={
            <Row style={{ border: 'none' }}>
              <Col xs={24} md={18}>
                <p>This type of report submission will be posted online publicly.</p>
              </Col>
            </Row>
          }
          type="warning"
          showIcon
        />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col>
        <Field
          id="submission_year"
          name="submission_year"
          label={
            <span>
              <div style={{ paddingBottom: 8 }}>Report Compliance Year/Period*</div>
              <Typography.Text>
                Select the year for which the report is being submitted. Depending on the report,
                this may not be the current calendar year.
              </Typography.Text>
            </span>
          }
          component={renderConfig.YEAR}
          validate={[required, yearNotInFuture]}
          disabledDate={(currentDate) => currentDate.year() > moment().year}
        />
        </Col>
        <Col>
        <Form>
          <Form.Item label="Due Date">
            <Input placeholder="Select Date" />
          </Form.Item>
        </Form>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
        <Form layout="vertical">
          <Form.Item label="Submitter Name">
            <Input placeholder="Enter Name" style={{ borderWidth: '1px' }} />
          </Form.Item>
        </Form>
        </Col>
        <Col span={24}>
        <Form layout="vertical">
          <Form.Item label="Submitter Email">
            <Input placeholder="Enter Email" style={{ borderWidth: '1px' }} />
            Include a concise and descriptive title to the report
          </Form.Item>
        </Form>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
        <Form layout="vertical">
          <Form.Item label="Report Title and Additional Comment">
            <Input placeholder="Enter comment" style={{ borderWidth: '1px' }} />
            Include a concise and descriptive title to the report
          </Form.Item>
        </Form>
        </Col>
      </Row>
     
      <Typography.Title level={4}>
        Report File(s)
      </Typography.Title>
      <ReportSubmissions
        mineGuid={mineGuid}
        // mineReportSubmissions={state.mineReportSubmissions}
        // updateMineReportSubmissions={updateMineReportSubmissions}
      />
      {/* <Row>
        <Col span={12}>
          <Typography.Paragraph strong className="margin-large--top">
            Report Code Requirement
          </Typography.Paragraph>
          <Form layout="vertical">
            <Form.Item label="Enter Code Section">
              <Input placeholder="10.4.1" />
            </Form.Item>
          </Form>
          <Typography.Paragraph strong className="margin-large--top">
            Common Reports
          </Typography.Paragraph>
        </Col>
      </Row> */}
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
)(AddReportDetails);


