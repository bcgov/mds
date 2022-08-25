import React from "react";
import { compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Alert } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownMajorMinesApplicationStatusCodes } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  dropdownMajorMineAppStatusCodes: PropTypes.objectOf(PropTypes.string).isRequired,
  displayValues: PropTypes.shape({
    statusCode: PropTypes.string,
    updateUser: PropTypes.string,
    updateDate: PropTypes.string,
    majorMineAppStatusCodesHash: PropTypes.objectOf(PropTypes.string),
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  pristine: PropTypes.bool.isRequired,
};

export const UpdateMajorMineAppStatusForm = (props) => (
  <Form layout="vertical" onSubmit={(e) => props.handleSubmit(e, props.formValues)} onValuesChange>
    <Col span={24}>
      <Alert
        message={
          props.displayValues.majorMineAppStatusCodesHash[props.displayValues.statusCode] || "N/A"
        }
        description={
          <Row>
            <Col xs={24} md={18}>
              <p>
                Final IRT was submitted by {props.displayValues.updateUser} on{" "}
                {props.displayValues.updateDate}, waiting for ministry review.
              </p>
              <b>Please note that updating this status will notify the project proponent.</b>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item>
                <Field
                  id="status_code"
                  name="status_code"
                  label=""
                  placeholder="Action"
                  component={renderConfig.SELECT}
                  validate={[required]}
                  data={props.dropdownMajorMineAppStatusCodes}
                />
              </Form.Item>
              {!props.pristine && (
                <div className="right center-mobile">
                  <Button className="full-mobile" type="primary" htmlType="submit">
                    Update Status
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        }
        type="warning"
        showIcon
      />
    </Col>
  </Form>
);

UpdateMajorMineAppStatusForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.UPDATE_MAJOR_MINE_APPLICATION)(state) || {},
    dropdownMajorMineAppStatusCodes: getDropdownMajorMinesApplicationStatusCodes(state),
  })),
  reduxForm({
    form: FORM.UPDATE_MAJOR_MINE_APPLICATION,
    onSubmitSuccess: resetForm(FORM.UPDATE_MAJOR_MINE_APPLICATION),
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(UpdateMajorMineAppStatusForm);
