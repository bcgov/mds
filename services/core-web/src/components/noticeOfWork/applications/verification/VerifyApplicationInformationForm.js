import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, formValueSelector } from "redux-form";
import { Button, Divider } from "antd";
import { Form } from "@ant-design/compatible";
import CustomPropTypes from "@/customPropTypes";

import * as FORM from "@/constants/forms";
import PropTypes from "prop-types";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import EditNOWMineAndLocation from "@/components/Forms/noticeOfWork/EditNOWMineAndLocation";
import EditNoWContacts from "@/components/Forms/noticeOfWork/EditNoWContacts";

const propTypes = {
  contactFormValues: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  longitude: PropTypes.string,
  latitude: PropTypes.string,
};

const defaultProps = {
  latitude: "",
  longitude: "",
  contactFormValues: [],
};

export const VerifyApplicationInformationForm = (props) => {
  const values = {
    mine_guid: props.mineGuid,
    longitude: props.noticeOfWork.longitude,
    latitude: props.noticeOfWork.latitude,
  };

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <h4>Verify Mine</h4>
      <p>
        Review the information below to confirm that this Notice of Work belongs with this mine
        record.
      </p>
      <br />
      <p>
        You can change the mine and/or update the NoW&lsquo;s Longitude and Latitude. All
        information can be updated on the Administrative tab after the initial verification until
        issuance of the permit.
      </p>
      <br />
      <EditNOWMineAndLocation
        initialValues={values}
        latitude={props.latitude}
        longitude={props.longitude}
      />
      <br />
      <br />
      <h4>Match Application Contacts to Core Contacts</h4>
      <p>Select a Contact from Core for each person shown, or update the Roles if required.</p>
      <Divider />
      <EditNoWContacts
        initialValues={props.originalNoticeOfWork}
        contacts={props.originalNoticeOfWork.contacts}
        contactFormValues={props.contactFormValues}
        isVerifying
      />
      <div className="right center-mobile">
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Button type="primary" htmlType="submit" disabled={props.submitting}>
            Verify Application
          </Button>
        </AuthorizationWrapper>
      </div>
    </Form>
  );
};

VerifyApplicationInformationForm.propTypes = propTypes;
VerifyApplicationInformationForm.defaultProps = defaultProps;
const selector = formValueSelector(FORM.VERIFY_NOW_APPLICATION_FORM);
const mapStateToProps = (state) => ({
  latitude: selector(state, "latitude"),
  longitude: selector(state, "longitude"),
  contactFormValues: selector(state, "contacts"),
});

export default compose(
  connect(mapStateToProps, null),
  reduxForm({
    form: FORM.VERIFY_NOW_APPLICATION_FORM,
  })
)(VerifyApplicationInformationForm);
