import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { Alert, Button, Skeleton, Typography } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { IVCInvitation, LOADING_STATUS, VC_CONNECTION_STATES } from "@mds/common";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { getVCWalletConnectionInvitation } from "@mds/common/redux/selectors/verifiableCredentialSelectors";
import { createVCWalletInvitation } from "@mds/common/redux/actionCreators/verifiableCredentialActionCreator";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

interface CreateInvitationFormProps {
  partyGuid: string;
  partyName: string;
  connectionState: string;
}

interface FormStateProps {
  createVCWalletInvitation: ActionCreator<typeof createVCWalletInvitation>;
  invitation: IVCInvitation;
}

export const CreateInvitationForm: FC<CreateInvitationFormProps & FormStateProps> = ({
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

  return (
    <FormWrapper
      name={FORM.CREATE_VC_CONNECTION_INVITATION}
      onSubmit={getInvitation}
      isModal
      reduxFormConfig={{
        touchOnBlur: false,
        onSubmitSuccess: resetForm(FORM.CREATE_VC_CONNECTION_INVITATION),
      }}
    >
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
          <RenderSubmitButton
            buttonProps={{
              disabled: loading === LOADING_STATUS.sent || invitation.invitation_url?.length > 0,
            }}
            buttonText={`Generate Invitation for ${partyName}`}
          />
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
        <RenderCancelButton buttonText="Close" />
      </div>
    </FormWrapper>
  );
};

const mapStateToProps = (state) => ({
  invitation: getVCWalletConnectionInvitation(state),
});

const mapDispatchToProps = {
  createVCWalletInvitation,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  CreateInvitationForm
) as FC<CreateInvitationFormProps>;
