import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Row, Col, Popconfirm, Button, Descriptions, Typography, Badge, Tooltip, Icon } from "antd";
import { dateNotBeforeOther, dateNotAfterOther, date } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { INFO_CIRCLE } from "@/constants/assets";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { getWorkInformationBadgeStatusType } from "@/constants/theme";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  cancelEdit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
};

const defaultProps = {
  initialValues: { isEditMode: false },
};

export class AddMineWorkInformationForm extends Component {
  render() {
    console.log(this.props.isEditMode);
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={22}>
            <Descriptions column={5} colon={false}>
              <Descriptions.Item
                label={
                  <>
                    <Tooltip
                      overlayClassName="minespace-tooltip"
                      title={
                        <>
                          <Typography.Text strong>
                            Health, Safety and Reclamation Code for Mines in British Columbia
                          </Typography.Text>
                          <br />
                          <Typography.Text underline>Notice To Start Work</Typography.Text>
                          <br />
                          <Typography.Text>
                            6.2.1 The manager shall give 10 days’ notice to an inspector of
                            intention to start [any mining activity] in, at, or about a mine,
                            including seasonal reactivation.
                          </Typography.Text>
                        </>
                      }
                      placement="right"
                      mouseEnterDelay={0.3}
                    >
                      <Icon type="info-circle" />
                    </Tooltip>
                    Work Start Date
                  </>
                }
              >
                <Form.Item>
                  <Field
                    id="work_start_date"
                    name="work_start_date"
                    placeholder="Select Work Start Date"
                    component={renderConfig.DATE}
                    disabled={!this.props.isEditMode}
                    validate={[date, dateNotAfterOther(this.props.formValues.work_stop_date)]}
                    format={null}
                  />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item
                overlayClassName="minespace-tooltip"
                label={
                  <>
                    <Tooltip
                      title={
                        <>
                          <Typography.Text strong>
                            Health, Safety and Reclamation Code for Mines in British Columbia
                          </Typography.Text>
                          <br />
                          <Typography.Text underline>Notice to Stop Work</Typography.Text>
                          <br />
                          <Typography.Text>
                            6.2.2 The manager shall give notice to an inspector of intention to stop
                            [any mining activity] in, at, or about a mine, permanently,
                            indefinitely, or for a definite period exceeding 30 days, and except in
                            an emergency, the notice shall be not less than seven days.
                          </Typography.Text>
                        </>
                      }
                      placement="right"
                      mouseEnterDelay={0.3}
                    >
                      <Icon type="info-circle" />
                    </Tooltip>
                    Work Stop Date
                  </>
                }
              >
                <Form.Item>
                  <Field
                    id="work_stop_date"
                    name="work_stop_date"
                    placeholder="Select Work Stop Date"
                    component={renderConfig.DATE}
                    disabled={!this.props.isEditMode}
                    validate={[date, dateNotBeforeOther(this.props.formValues.work_start_date)]}
                    format={null}
                  />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Work Status">
                <Badge
                  status={getWorkInformationBadgeStatusType(this.props.initialValues.work_status)}
                  text={this.props.initialValues.work_status}
                />
              </Descriptions.Item>
            </Descriptions>
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
                disabled={!this.props.isEditMode}
                component={renderConfig.AUTO_SIZE_FIELD}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.cancelEdit}
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
