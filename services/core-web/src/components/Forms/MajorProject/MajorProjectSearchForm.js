import React, { Component } from "react";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";

import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  toggleAdvancedSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  isAdvanceSearch: PropTypes.bool.isRequired,
  statusCodes: PropTypes.string.isRequired,
};

const defaultProps = {
  isAdvanceSearch: false,
};

export class MajorProjectsSearchForm extends Component {
  handleReset = () => {
    this.props.reset();
    this.props.handleReset();
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="search"
              name="search"
              component={renderConfig.FIELD}
              placeholder="Search by mine name or number"
            />
          </Col>
        </Row>
        {this.props.isAdvanceSearch && (
          <div>
            <Row gutter={6}>
              <Col md={24} xs={24}>
                <Field
                  id="status_code"
                  name="status_code"
                  placeholder="Select Application Statuses"
                  component={renderConfig.SELECT}
                  data={this.props.statusCodes}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="application_stage"
                  name="application_stage"
                  placeholder="Select Application Stages"
                  component={renderConfig.SELECT}
                  data={[
                    { value: "ProjectSummary", label: "Project Summary" },
                    { value: "InformationRequirementsTable", label: "IRT" },
                    { value: "MajorMineApplication", label: "Final Application" },
                  ]}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="updated_date"
                  name="updated_date"
                  placeholder="Select Latest Updated Date"
                  component={renderConfig.DATE}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="mrc_review_required"
                  name="mrc_review_required"
                  placeholder="Select MRC review"
                  component={renderConfig.SELECT}
                  data={[
                    { value: "true", label: "Required" },
                    { value: "false", label: "No Required" },
                  ]}
                  format={null}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="project_lead_name"
                  name="project_lead_name"
                  placeholder="Search by EMLI project lead"
                  component={renderConfig.FIELD}
                />
              </Col>
            </Row>
          </div>
        )}
        <div className="left center-mobile">
          <Button className="btn--dropdown" onClick={this.props.toggleAdvancedSearch}>
            {this.props.isAdvanceSearch ? "Collapse Filters" : "Expand Filters"}
            {this.props.isAdvanceSearch ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </div>

        <div className="right center-mobile">
          <Button className="full-mobile" type="secondary" htmlType="reset">
            Clear Filters
          </Button>
          <Button className="full-mobile" type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </div>
      </Form>
    );
  }
}

MajorProjectsSearchForm.propTypes = propTypes;
MajorProjectsSearchForm.defaultParams = defaultProps;

export default reduxForm({
  form: FORM.MAJOR_MINE_APPLICATION_ADVANCED_SEARCH,
  touchOnBlur: false,
  enableReinitialize: true,
})(MajorProjectsSearchForm);
