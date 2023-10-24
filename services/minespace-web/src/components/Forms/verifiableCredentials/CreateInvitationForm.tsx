import React, { FC } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { reduxForm, InjectedFormProps } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import IVCInvitation from "@mds/common";
import { ActionCreator } from "@/interfaces/actionCreator";
import { getVCWalletConnectionInvitation } from "@common/selectors/verifiableCredentialSelectors";
import { createVCWalletInvitation } from "@common/actionCreators/verifiableCredentialActionCreator";

interface CreateInvitationFormProps {
  closeModal: () => void;
  partyGuid: string;
  partyName: string;
}

interface FormStateProps {
  handleSubmit(args: any): Promise<void>;
  createVCWalletInvitation: ActionCreator<typeof createVCWalletInvitation>;
  submitting: boolean;
  invitation: IVCInvitation;
}

export const CreateInvitationForm: FC<CreateInvitationFormProps &
  FormStateProps &
  InjectedFormProps<any>> = ({ closeModal, partyGuid, partyName, invitation, ...props }) => {
  return (
    <Form layout="vertical">
      <Button disabled={props.submitting} onClick={() => props.createVCWalletInvitation(partyGuid)}>
        Generate Invitation for {partyName}.
      </Button>
      <br />
      <br />
      <p>
        <b>
          Accept this invitation url using the digital wallet of {partyName}. to establish a secure
          connection for the purposes of recieving Mines Act Permits
        </b>
      </p>
      <br />
      <Button type="primary">Copy to Clipboard</Button>
      <br />
      <br />
      <p>{invitation.invitation_url}</p>

      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={closeModal}
        okText="Yes"
        cancelText="No"
        disabled={props.submitting}
      >
        <Button disabled={props.submitting}>Cancel</Button>
      </Popconfirm>
    </Form>
  );
};

const mapStateToProps = (state) => ({
  invitation: getVCWalletConnectionInvitation(state),
});

const mapDispatchToProps = {
  createVCWalletInvitation,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.CREATE_VC_CONNECTION_INVITATION,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.CREATE_VC_CONNECTION_INVITATION),
  })
)(CreateInvitationForm) as FC<CreateInvitationFormProps>;
