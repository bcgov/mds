import React, { Component } from "react";
import CustomPropTypes from "@/customPropTypes";
import NOWContactForm from "@/components/Forms/noticeOfWork/NOWContactForm";

const propTypes = {
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};
// eslint-disable-next-line react/prefer-stateless-function
export class VerifyNoWContacts extends Component {
  render() {
    return (
      <div>
        <h4>Verify Contacts</h4>
        <p>Choose contacts from CORE for the roles provided by the Notice Of Work.</p>
        <br />
        <NOWContactForm contacts={this.props.originalNoticeOfWork.contacts} />
      </div>
    );
  }
}

VerifyNoWContacts.propTypes = propTypes;

export default VerifyNoWContacts;
