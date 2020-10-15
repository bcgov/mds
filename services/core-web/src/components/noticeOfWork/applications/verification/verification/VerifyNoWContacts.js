import React, { Component } from "react";
import NOWContactForm from "@/components/Forms/noticeOfWork/NOWContactForm";
import AddPartyComponentWrapper from "@/components/common/wrappers/AddPartyComponentWrapper";

const propTypes = {};

const defaultProps = {
  title: "Verify Contacts",
};
// eslint-disable-next-line react/prefer-stateless-function
export class VerifyNoWContacts extends Component {
  render() {
    return (
      <div>
        <h4>Verify Contacts</h4>
        <p>Choose contacts from CORE for the roles provided by the Notice Of Work.</p>
        <br />
        <AddPartyComponentWrapper
          clearOnSubmit={() => {}}
          content={NOWContactForm}
          childProps={this.props}
        />
      </div>
    );
  }
}

VerifyNoWContacts.propTypes = propTypes;
VerifyNoWContacts.defaultProps = defaultProps;

export default VerifyNoWContacts;
