import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { reduxForm, InjectedFormProps } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm, Skeleton } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { IVCInvitation, LOADING_STATUS } from "@mds/common";
import { ActionCreator } from "@/interfaces/actionCreator";
import { getVCWalletConnectionInvitation } from "@common/selectors/verifiableCredentialSelectors";
import { createVCWalletInvitation } from "@common/actionCreators/verifiableCredentialActionCreator";

interface CreateInvitationFormProps {
  closeModal: () => void;
  partyGuid: string;
  partyName: string;
  connectionState: string;
}

interface FormStateProps {
  handleSubmit(args: any): Promise<void>;
  createVCWalletInvitation: ActionCreator<typeof createVCWalletInvitation>;
  submitting: boolean;
  invitation: IVCInvitation;
}

export const CreateInvitationForm: FC<CreateInvitationFormProps &
  FormStateProps &
  InjectedFormProps<any>> = ({
    closeModal,
    partyGuid,
    partyName,
    connectionState,
    invitation,
    ...props
  }) => {
    const isPreLoaded = invitation.invitation_url ? LOADING_STATUS.success : LOADING_STATUS.none;
    const [loading, setLoading] = useState(isPreLoaded);

    const getInvitation = () => {
      setLoading(LOADING_STATUS.sent);
      props
        .createVCWalletInvitation(partyGuid)
        .then(() => setLoading(LOADING_STATUS.success))
        .catch(() => setLoading(LOADING_STATUS.error));
    };

    const copyTextToClipboard = () => {
      navigator.clipboard.writeText(invitation.invitation_url);
    };

    const disableGenerateButton: boolean =
      connectionState === "active" ||
      props.submitting ||
      loading === LOADING_STATUS.sent ||
      invitation.invitation_url?.length > 0;
    return (
      <Form layout="vertical">
        <p><b>Current Connection Status: {connectionState}</b></p>
        {connectionState !== "active" && (
          <div>
            <p> By generating this invitation, you choose to connect your organization’s digital wallet to the digital wallet of the Chief Permitting Officer of B.C. Once connected, your organization will have the option to receive permit(s) in the form of digital credentials. This is a one-time action that applies to all major mine permits.</p>
            <br />
            <Button disabled={disableGenerateButton} onClick={getInvitation}>
              Generate Invitation for {partyName}.
            </Button>
            <br />
          </div>
        )}
        {loading !== LOADING_STATUS.none && (
          <Skeleton loading={loading === LOADING_STATUS.sent}>
            {loading === LOADING_STATUS.success && (
              <>
                <br />
                <p>
                  <b>
                    Accept this invitation url using the digital wallet of {partyName}. to establish a
                    secure connection for the purposes of recieving Mines Act Permits
                  </b>
                </p>
                <br />
                <Button type="primary" onClick={copyTextToClipboard}>
                  Copy to Clipboard
                </Button>
                <br />
                <br />
                <p>{invitation.invitation_url}</p>
              </>
            )}
            {loading === LOADING_STATUS.error && (
              <p>There was an error generating your invitation.</p>
            )}
          </Skeleton>
        )}
        <br />
        <br />
        <p><b>Note:</b></p>
        <p><b>Digital Wallet:</b> A digital version of a physical wallet that enables organizations to send and receive digital credentials. </p>
        <p><b>Digital Credential:</b> A digital version of a physical credential, such as your mine permit. Digital credentials are cryptographically protected and verified in real-time, ensuring a high degree of privacy and security regardless of where information is shared. </p>
        <Popconfirm
          placement="topRight"
          title="Are you sure?"
          onConfirm={closeModal}
          okText="Yes"
          cancelText="No"
          disabled={props.submitting}
        >
          <Button disabled={props.submitting}>Close</Button>
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
