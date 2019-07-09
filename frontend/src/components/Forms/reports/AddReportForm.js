import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { getDropdownMineReportDefinitionOptions } from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  dropdownMineReportDefinitionOptions: PropTypes.arrayOf(
    PropTypes.objectOf(CustomPropTypes.dropdownListItem)
  ).isRequired,
};

const defaultProps = {};

export class AddReportForm extends Component {
  state = {
    uploadedFiles: [],
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24} className="border--right--layout">
            <Form.Item>
              <Field
                id="mine_report_definition_guid"
                name="mine_report_definition_guid"
                label="Code Defined Reports"
                placeholder="Please select a report"
                data={this.props.dropdownMineReportDefinitionOptions}
                doNotPinDropdown
                component={renderConfig.SELECT}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="submission_year"
                name="submission_year"
                label="Submission Year"
                placeholder="Please enter a year"
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="due_date"
                name="due_date"
                label="Due Date"
                component={renderConfig.DATE}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button className="full-mobile" type="primary" htmlType="submit">
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

AddReportForm.propTypes = propTypes;
AddReportForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    dropdownMineReportDefinitionOptions: getDropdownMineReportDefinitionOptions(state),
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddReportForm);
