import React, { useState } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";

import { reduxForm, formValueSelector, reset, change } from "redux-form";
import { Button, Divider } from "antd";
import { Form } from "@ant-design/compatible";
import CustomPropTypes from "@/customPropTypes";

import { clearAllSearchResults } from "@common/actionCreators/searchActionCreator";
import PropTypes from "prop-types";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";
import EditNOWMineAndLocation from "@/components/Forms/noticeOfWork/EditNOWMineAndLocation";
import VerifyNoWContacts from "@/components/Forms/noticeOfWork/VerifyNoWContacts";

const propTypes = {
  contactFormValues: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isImporting: PropTypes.bool.isRequired,
  longitude: PropTypes.string,
  latitude: PropTypes.string,
  change: PropTypes.func.isRequired,
  clearAllSearchResults: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  mine: PropTypes.string.isRequired,
};

const defaultProps = {
  latitude: "",
  longitude: "",
  contactFormValues: [],
};

export const VerifyApplicationInformationForm = (props) => {
  const [wasFormReset, setReset] = useState(false);
  const [confirmedContacts, setConfirmedContacts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const values = {
    mine_guid: props.mineGuid,
    longitude: props.noticeOfWork.longitude,
    latitude: props.noticeOfWork.latitude,
  };

  const handleReset = () => {
    setReset(true);
    props.reset(FORM.VERIFY_NOW_APPLICATION_FORM);
    props.change(FORM.VERIFY_NOW_APPLICATION_FORM, "contacts", props.originalNoticeOfWork.contacts);
    setSelectedRows([]);
    setConfirmedContacts([]);
    props.clearAllSearchResults();
  };

  // const contactLength = props.contactFormValues.length ===
  const confirmed = `${confirmedContacts.length}/${props.contactFormValues.length} contacts confirmed`;
  const disabled = props.contactFormValues.length > confirmedContacts.length || !props.mine;
  const noMine = props.mine ? "" : "A mine must be associated to this application";
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
      <h4>Match the contacts from the Notice of Work application to contacts in CORE.</h4>
      <Divider />
      <VerifyNoWContacts
        initialValues={props.originalNoticeOfWork}
        contactFormValues={props.contactFormValues}
        wasFormReset={wasFormReset}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        confirmedContacts={confirmedContacts}
        setConfirmedContacts={setConfirmedContacts}
      />
      <div className="right center-mobile">
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Button type="secondary" onClick={handleReset}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={props.isImporting} disabled={disabled}>
            Verify Application
          </Button>
        </AuthorizationWrapper>
        <p className="violet">{confirmed}</p>
        <p className="red">{noMine}</p>
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
  mine: selector(state, "mine_guid"),
  contactFormValues: selector(state, "contacts"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      reset,
      change,
      clearAllSearchResults,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.VERIFY_NOW_APPLICATION_FORM,
    enableReinitialize: true,
  })
)(VerifyApplicationInformationForm);
