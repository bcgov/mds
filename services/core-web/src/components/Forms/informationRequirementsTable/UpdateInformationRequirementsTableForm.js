import React from "react";
import { compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Alert } from "antd";
import { required, requiredList } from "@common/utils/Validate";
import { resetForm, formatDate } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { getDropdownInformationRequirementsTableStatusCodes } from "@common/selectors/staticContentSelectors";

const propTypes = {
  // getDropdownInformationRequirementsTableStatusCodes: PropTypes.objectOf(PropTypes.any).isRequired,
  // informationRequirementsTableStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // handleSubmit: PropTypes.func.isRequired,
  // updateUser: PropTypes.string.isRequired,
  // updateDate: PropTypes.string.isRequired,
  // formValues: PropTypes.objectOf(PropTypes.any),
  // handleChange: PropTypes.func.isRequired,
  // handleSearch: PropTypes.func.isRequired,
};

export const UpdateInformationRequirementsTableForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Col span={24}>
      <Row>
        <Col span={18}>
          <Alert
            message={
              props.displayValues.informationRequirementsTableStatusCodesHash[
                props.formValues.status_code
              ] || "N/A"
            }
            description={
              <p>
                Final IRT was submitted by {props.displayValues.updateUser} on{" "}
                {formatDate(props.displayValues.updateDate)}, waiting for ministry review.
              </p>
            }
            type="warning"
            showIcon
          />
        </Col>
        <Col span={6}>
          <Form.Item>
            <Field
              id="status_code"
              name="status_code"
              label=""
              placeholder="Action"
              component={renderConfig.SELECT}
              validate={[required]}
              data={props.dropdownInformationRequirementsTableStatusCodes.filter(
                (sc) => sc.value !== props.formValues.status_code
              )}
            />
          </Form.Item>
        </Col>
      </Row>
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
