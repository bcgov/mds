import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { dateNotBeforeOther, dateNotAfterOther, date } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  initialValues: {},
};

export class AddMineWorkInformationForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                id="work_start_date"
                name="work_start_date"
                label="Work Start Date"
                placeholder="Select Work Start Date"
                component={renderConfig.DATE}
                validate={[date, dateNotAfterOther(this.props.formValues.work_stop_date)]}
                format={null}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Field
                id="work_stop_date"
                name="work_stop_date"
                label="Work Stop Date"
                placeholder="Select Work Stop Date"
                component={renderConfig.DATE}
                validate={[date, dateNotBeforeOther(this.props.formValues.work_start_date)]}
                format={null}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="work_comments"
                name="work_comments"
                label="Comments"
                placeholder="Enter Comments"
                component={renderConfig.AUTO_SIZE_FIELD}
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
            disabled={this.props.submitting}
          >
            <Button className="full-mobile" type="secondary" disabled={this.props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

AddMineWorkInformationForm.propTypes = propTypes;
AddMineWorkInformationForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ADD_MINE_WORK_INFORMATION)(state) || {},
  })),
  reduxForm({
    form: FORM.ADD_MINE_WORK_INFORMATION,
    onSubmitSuccess: resetForm(FORM.ADD_MINE_WORK_INFORMATION),
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(AddMineWorkInformationForm);
