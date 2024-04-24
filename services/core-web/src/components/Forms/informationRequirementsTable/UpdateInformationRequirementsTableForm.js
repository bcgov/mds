import React from "react";
import { compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Field, getFormValues, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Alert, Button, Col, Row } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownInformationRequirementsTableStatusCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  dropdownInformationRequirementsTableStatusCodes: PropTypes.objectOf(PropTypes.string).isRequired,
  displayValues: PropTypes.shape({
    statusCode: PropTypes.string,
    updateUser: PropTypes.string,
    updateDate: PropTypes.string,
    informationRequirementsTableStatusCodesHash: PropTypes.objectOf(PropTypes.string),
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  pristine: PropTypes.bool.isRequired,
};

const stausDisplayMessage = (status) => {
  let text = "";
  if (status === "APV") {
    text = ". Review is complete.";
  } else if (status === "CHR") {
    text = ". Changes have been requested.";
  } else {
    text = ", waiting for ministry review.";
  }
  return text;
};

export const UpdateInformationRequirementsTableForm = (props) => (
  <Form layout="vertical" onSubmit={(e) => props.handleSubmit(e, props.formValues)} onValuesChange>
    <Col span={24}>
      <Alert
        message={
          props.displayValues.informationRequirementsTableStatusCodesHash[
            props.displayValues.statusCode
          ] || "N/A"
        }
        description={
          <Row>
            <Col xs={24} md={18}>
              <p>
                Final IRT was submitted by {props.displayValues.updateUser} on{" "}
                {props.displayValues.updateDate}
                {stausDisplayMessage(props.displayValues.statusCode)}
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
                  data={props.dropdownInformationRequirementsTableStatusCodes}
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

UpdateInformationRequirementsTableForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.UPDATE_INFORMATION_REQUIREMENTS_TABLE)(state) || {},
    dropdownInformationRequirementsTableStatusCodes: getDropdownInformationRequirementsTableStatusCodes(
      state
    ),
  })),
  reduxForm({
    form: FORM.UPDATE_INFORMATION_REQUIREMENTS_TABLE,
    onSubmitSuccess: resetForm(FORM.UPDATE_INFORMATION_REQUIREMENTS_TABLE),
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(UpdateInformationRequirementsTableForm);
