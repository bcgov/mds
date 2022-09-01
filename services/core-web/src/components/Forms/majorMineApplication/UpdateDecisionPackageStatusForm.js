import React from "react";
import { compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Alert } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm, formatDate } from "@common/utils/helpers";
import { getDropdownProjectDecisionPackageStatusCodes } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  dropdownProjectDecisionPackageStatusCodes: PropTypes.objectOf(PropTypes.string).isRequired,
  displayValues: PropTypes.shape({
    status_code: PropTypes.string,
    updateUser: PropTypes.string,
    updateDate: PropTypes.string,
    projectDecisionPackageStatusCodesHash: PropTypes.objectOf(PropTypes.string),
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  pristine: PropTypes.bool.isRequired,
};

const alertText = (status, updateUser, updateDate) => {
  let text = "";
  if (status === "NTS") {
    text = `This decision package has not been started. Change this decision package’s status to
    “In Progress” to add and remove relevant documents to this decision package.
    Proponents will not see decision package files until it is completed.`;
  } else if (status === "INP") {
    text = `This decision package is in progress as of ${formatDate(
      updateDate
    )} by ${updateUser}. You can now add and remove relevant documents to this decision package. Proponents will not see decision package files until it is completed.`;
  } else if (status === "CMP") {
    text = `This decision package was marked as completed on ${updateDate} by ${updateUser}. You can no longer edit this decision package’s contents (unless you change it’s status to ‘In Progress’ again). Proponents are now able to view Pronent visible sections.`;
  }
  return text;
};

export const UpdateDecisionPackageStatusForm = (props) => (
  <Form layout="vertical" onSubmit={(e) => props.handleSubmit(e, props.formValues)} onValuesChange>
    <Col span={24}>
      <Alert
        message={
          props.displayValues.projectDecisionPackageStatusCodesHash[props.displayValues.status_code]
        }
        description={
          <Row>
            <Col xs={24} md={18}>
              <p>
                {alertText(
                  props.displayValues.status_code,
                  props.displayValues.updateUser,
                  props.displayValues.updateDate
                )}
              </p>
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
                  data={props.dropdownProjectDecisionPackageStatusCodes}
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
        type={["NTS", "INP"].includes(props.displayValues.status_code) ? "warning" : "success"}
        showIcon
      />
    </Col>
  </Form>
);

UpdateDecisionPackageStatusForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.UPDATE_PROJECT_DECISION_PACKAGE)(state) || {},
    dropdownProjectDecisionPackageStatusCodes: getDropdownProjectDecisionPackageStatusCodes(state),
  })),
  reduxForm({
    form: FORM.UPDATE_PROJECT_DECISION_PACKAGE,
    onSubmitSuccess: resetForm(FORM.UPDATE_PROJECT_DECISION_PACKAGE),
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(UpdateDecisionPackageStatusForm);
