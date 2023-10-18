import React, { Component } from "react";
import PropTypes from "prop-types";
import { reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  createVCWalletInvitation: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  partyGuid: PropTypes.string.isRequired,
  partyName: PropTypes.string.isRequired,
  invitation: PropTypes.any.isRequired,
};

export class CreateInvitationForm extends Component {
  render() {
    return (
      <Form layout="vertical">
        <Button
          className="secondary"
          type="secondary"
          disabled={this.props.submitting}
          onClick={this.props.createVCWalletInvitation(this.props.partyGuid)}
        >
          Generate Invitation for {this.props.partyName}.
        </Button>
        <br />
        <br />
        <p>
          <b>
            Accept this invitation url using the digital wallet of {this.props.partyName}. to
            establish a secure connection for the purposes of recieving Mines Act Permits
          </b>
        </p>
        <br />
        <Button className="primary" type="primary">
          Copy to Clipboard
        </Button>
        <br />
        <p></p>

        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={this.props.closeModal}
          okText="Yes"
          cancelText="No"
          disabled={this.props.submitting}
        >
          <Button disabled={this.props.submitting}>Cancel</Button>
        </Popconfirm>
      </Form>
    );
  }
}

CreateInvitationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CREATE_VC_CONNECTION_INVITATION,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.CREATE_VC_CONNECTION_INVITATION),
})(CreateInvitationForm);
