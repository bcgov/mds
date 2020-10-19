/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { Form } from "@ant-design/compatible";
import { Field, reduxForm } from "redux-form";
import { resetForm } from "@common/utils/helpers";
import { compose } from "redux";
import * as FORM from "@/constants/forms";
import ChangeNOWLocationForm from "@/components/Forms/noticeOfWork/ChangeNOWLocationForm";
import VerifyNoWContacts from "@/components/noticeOfWork/applications/verification/verification/VerifyNoWContacts";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  values: PropTypes.objectOf(PropTypes.string).isRequired,
  handleNOWImport: PropTypes.func.isRequired,
};

export const VerifyNOWMineInformation = (props) => (
  <div>
    <h4>Verify Mine</h4>
    <p>
      Review the information below to confirm that this Notice of Work belongs with this mine
      record.
    </p>
    <br />
    <p>
      You can change the mine and/or update the NoW&lsquo;s Longitude and Latitude. All information
      can be updated on the Administrative tab after the initial verification until issuance of the
      permit.
    </p>
    <br />
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <ChangeNOWLocationForm
        initialValues={props.values}
        // onSubmit={props.handleNOWImport}
        title="Confirm Location"
      />
      {/* <Divider />
      <VerifyNoWContacts initialValues={props.originalNoticeOfWork} contacts={props.contacts} />
      <div className="right center-mobile">
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Button type="primary" htmlType="submit">
            Verify Application
          </Button>
        </AuthorizationWrapper>
      </div> */}
    </Form>
  </div>
);

VerifyNOWMineInformation.propTypes = propTypes;

export default compose(
  // connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.VERIFY_NOW_APPLICATION_FORM,
    onSubmitSuccess: resetForm(FORM.VERIFY_NOW_APPLICATION_FORM),
    // calling "this.props.submit" outside the form, needs an onSubmit handler to force validations
    // onSubmit: () => {},
  })
)(VerifyNOWMineInformation);

// export default VerifyNOWMineInformation;
