import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { reduxForm, InjectedFormProps } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Alert, Button, Popconfirm, Skeleton, Typography } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { IVCInvitation, LOADING_STATUS, VC_CONNECTION_STATES } from "@mds/common";
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

  const friendlyConnectionState = VC_CONNECTION_STATES[connectionState];

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
    props.submitting || loading === LOADING_STATUS.sent || invitation.invitation_url?.length > 0;
  return (
    <Form layout="vertical">
      <Alert
        type="info"
        message="Key Terms"
        showIcon
        description={
          <>
            <Typography.Paragraph>
              <Typography.Text strong>Digital Wallet: </Typography.Text>A digital version of a
              physical wallet that enables organizations to send and receive digital credentials.
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Digital Credential: </Typography.Text>A digital version of a
              physical credential, such as your mine permit. Digital credentials are
              cryptographically protected and verified in real-time, ensuring a high degree of
              privacy and security regardless of where information is shared.
            </Typography.Paragraph>
          </>
        }
      />
      {friendlyConnectionState !== VC_CONNECTION_STATES.active && (
        <div>
          <p>
            By generating this invitation, you choose to connect your organization’s digital wallet
            to the digital wallet of the Chief Permitting Officer of B.C. Once connected, your
            organization will have the option to receive digital credentials to prove they hold a
            valid Mines Act Permit from the Government of B.C. This is a one-time action that
            applies to all major mine permits.
          </p>
          <br />
          <Button disabled={disableGenerateButton} onClick={getInvitation} type="primary">
            Generate Invitation for {partyName}
          </Button>
          <br />
        </div>
      )}
      <br />
      {loading !== LOADING_STATUS.none && (
        <Skeleton loading={loading === LOADING_STATUS.sent}>
          {loading === LOADING_STATUS.success && (
            <>
              <Typography.Paragraph strong>
                Copy this invitation URL into the digital wallet of {partyName} to establish a
                secure connection for the purpose of receiving digital credentials.
              </Typography.Paragraph>
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
      <div style={{ textAlign: "right" }}>
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
      </div>
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
