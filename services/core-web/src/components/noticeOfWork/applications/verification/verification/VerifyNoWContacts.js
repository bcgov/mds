/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Form, Field, formValueSelector } from "redux-form";
import { resetForm } from "@common/utils/helpers";
import NOWContactForm from "@/components/Forms/noticeOfWork/NOWContactForm";
import { compose } from "redux";
import * as FORM from "@/constants/forms";
import AddPartyComponentWrapper from "@/components/common/wrappers/AddPartyComponentWrapper";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";

const propTypes = {};

const defaultProps = {
  title: "Verify Contacts",
};
// eslint-disable-next-line react/prefer-stateless-function
export class VerifyNoWContacts extends Component {
  render() {
    return (
      <Form layout="vertical">
        <h4>Verify Contacts</h4>
        <p>Choose contacts from CORE for the roles provided by the Notice Of Work.</p>
        <br />
        <AddPartyComponentWrapper
          clearOnSubmit={() => {}}
          content={NOWContactForm}
          childProps={this.props}
        />
      </Form>
    );
  }
}

VerifyNoWContacts.propTypes = propTypes;
VerifyNoWContacts.defaultProps = defaultProps;

// const mapStateToProps = (state) => ({
//   partyRelationshipTypesList: getPartyRelationshipTypesList(state),
// });

// export default reduxForm({
//   form: FORM.NOW_CONTACT_FORM,
//   onSubmitSuccess: resetForm(FORM.NOW_CONTACT_FORM),
//   // calling "this.props.submit" outside the form, needs an onSubmit handler to force validations
//   onSubmit: () => {},
// })(NOWContactForm);
// export default connect(mapStateToProps)(VerifyNoWContacts);

export default compose(
  connect((state) => ({
    partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  })),
  reduxForm({
    form: FORM.NOW_CONTACT_FORM,
    onSubmitSuccess: resetForm(FORM.NOW_CONTACT_FORM),
    // calling "this.props.submit" outside the form, needs an onSubmit handler to force validations
    onSubmit: () => {},
  })
)(VerifyNoWContacts);
