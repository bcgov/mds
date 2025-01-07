import React from "react";
import { compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Field } from "redux-form";
import { Col, Row, Alert, Typography } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { resetForm, formatDate } from "@common/utils/helpers";
import { getDropdownProjectDecisionPackageStatusCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  dropdownProjectDecisionPackageStatusCodes: PropTypes.objectOf(PropTypes.string).isRequired,
  displayValues: PropTypes.shape({
    status_code: PropTypes.string,
    updateUser: PropTypes.string,
    updateDate: PropTypes.string,
    projectDecisionPackageStatusCodesHash: PropTypes.objectOf(PropTypes.string),
    documents: PropTypes.arrayOf(PropTypes.any),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
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
    text = `This decision package was marked as completed on ${formatDate(
      updateDate
    )} by ${updateUser}. You can no longer edit this decision package’s contents (unless you change it’s status to ‘In Progress’ again). Proponents are now able to view Proponent visible sections.`;
  }
  return <Typography.Text>{text}</Typography.Text>;
};

export const UpdateDecisionPackageStatusForm = (props) => {
  const isComplete = props.displayValues.status_code === "CMP";

  return (
    <FormWrapper
      initialValues={props.initialValues}
      name={FORM.UPDATE_PROJECT_DECISION_PACKAGE}
      reduxFormConfig={{
        onSubmitSuccess: resetForm(FORM.UPDATE_PROJECT_DECISION_PACKAGE),
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      onSubmit={(values) => {
        const submitPayload = {
          ...values,
          documents: props.displayValues?.documents,
        };
        return props.onSubmit(submitPayload);
      }}
      onValuesChange
    >
      <Col span={24}>
        <Alert
          message={
            props.displayValues.projectDecisionPackageStatusCodesHash[
            props.displayValues?.status_code
            ]
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
                <Field
                  id="status_code"
                  name="status_code"
                  label=""
                  placeholder="Action"
                  component={renderConfig.SELECT}
                  required
                  validate={[required]}
                  data={props.dropdownProjectDecisionPackageStatusCodes}
                />
                <div className="right center-mobile">
                  <RenderSubmitButton />
                </div>
              </Col>
            </Row>
          }
          type={!isComplete ? "warning" : "info"}
          showIcon
        />
      </Col>
    </FormWrapper>
  );
};

UpdateDecisionPackageStatusForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    dropdownProjectDecisionPackageStatusCodes: getDropdownProjectDecisionPackageStatusCodes(state),
  }))
)(UpdateDecisionPackageStatusForm);
