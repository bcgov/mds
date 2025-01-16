import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import { Row, Col, Descriptions, Typography, Badge, Tooltip } from "antd";
import { dateNotBeforeOther, dateNotAfterOther, date } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { getWorkInformationBadgeStatusType } from "@/constants/theme";
import * as STRINGS from "@/constants/strings";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  cancelEdit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
};

const defaultProps = {
  initialValues: {},
  isEditMode: false,
};

export const AddMineWorkInformationForm = (props) => {
  return (
    <FormWrapper
      onSubmit={props.onSubmit}
      initialValues={props.initialValues}
      scrollOnToggleEdit={false}
      name={FORM.ADD_MINE_WORK_INFORMATION}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
    >
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
                          6.2.1 The manager shall give 10 days’ notice to an inspector of intention
                          to start [any mining activity] in, at, or about a mine, including seasonal
                          reactivation.
                        </Typography.Text>
                      </>
                    }
                    placement="right"
                    mouseEnterDelay={0.3}
                  >
                    <InfoCircleOutlined className="padding-sm" />
                  </Tooltip>
                  Work Start Date
                </>
              }
            >
              <Field
                id="work_start_date"
                name="work_start_date"
                placeholder="Select Work Start Date"
                component={renderConfig.DATE}
                disabled={!props.isEditMode}
                validate={[date, dateNotAfterOther(props.formValues.work_stop_date)]}
                format={null}
              />
            </Descriptions.Item>
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
                        <Typography.Text underline>Notice to Stop Work</Typography.Text>
                        <br />
                        <Typography.Text>
                          6.2.2 The manager shall give notice to an inspector of intention to stop
                          [any mining activity] in, at, or about a mine, permanently, indefinitely,
                          or for a definite period exceeding 30 days, and except in an emergency,
                          the notice shall be not less than seven days.
                        </Typography.Text>
                      </>
                    }
                    placement="right"
                    mouseEnterDelay={0.3}
                  >
                    <InfoCircleOutlined className="padding-sm" />
                  </Tooltip>
                  Work Stop Date
                </>
              }
            >
              <Field
                id="work_stop_date"
                name="work_stop_date"
                placeholder="Select Work Stop Date"
                component={renderConfig.DATE}
                disabled={!props.isEditMode}
                validate={[date, dateNotBeforeOther(props.formValues.work_start_date)]}
                format={null}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Work Status">
              <Badge
                status={getWorkInformationBadgeStatusType(props.initialValues.work_status)}
                text={props.initialValues.work_status || STRINGS.NOT_APPLICABLE}
              />
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="work_comments"
            name="work_comments"
            label="Comments"
            placeholder="Enter Comments"
            minRows={3}
            disabled={!props.isEditMode}
            component={renderConfig.AUTO_SIZE_FIELD}
          />
        </Col>
      </Row>

      <div className="right center-mobile">
        <RenderCancelButton cancelFunction={props.cancelEdit} />
        <RenderSubmitButton buttonText={props.title} />
      </div>
    </FormWrapper>
  );
};

AddMineWorkInformationForm.propTypes = propTypes;
AddMineWorkInformationForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ADD_MINE_WORK_INFORMATION)(state) || {},
  }))
)(AddMineWorkInformationForm);
