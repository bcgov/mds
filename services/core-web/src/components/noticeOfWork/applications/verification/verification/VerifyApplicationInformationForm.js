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
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  longitude: PropTypes.string.isRequired,
  latitude: PropTypes.string.isRequired,
};

const defaultProps = {};
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
      <h4>Verify Contacts</h4>
      <p>Choose contacts from CORE for the roles provided by the Notice Of Work.</p>
      <br />
      <Divider />
      <EditNoWContacts
        initialValues={props.initialValues}
        contacts={props.originalNoticeOfWork.contacts}
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
});

export default compose(
  connect(mapStateToProps, null),
  reduxForm({
    form: FORM.VERIFY_NOW_APPLICATION_FORM,
  })
)(VerifyApplicationInformationForm);
