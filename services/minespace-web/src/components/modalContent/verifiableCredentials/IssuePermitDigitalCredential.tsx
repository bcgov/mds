import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { IPermit } from "@mds/common";
import { Alert, Button, Row, Typography } from "antd";
import React, { FC } from "react";

interface IssuePermitDigitalCredentialProps {
  closeModal: () => void;
  permit: IPermit;
  mineName: string;
  connectionState: string;
  openVCWalletInvitationModal: (
    event,
    partyGuid: string,
    partyName: string,
    connectionState: string
  ) => void;
}

export const IssuePermitDigitalCredential: FC<IssuePermitDigitalCredentialProps> = ({
  permit,
  mineName,
  connectionState = "",
  closeModal,
  openVCWalletInvitationModal,
}) => {
  const {
    permit_no,
    current_permittee,
    current_permittee_digital_wallet_connection_state,
    current_permittee_guid,
  } = permit;

  const content = {
    alertTitle: {
      noWallet:
        "Your digital wallet needs to be set up before you can add this permit to your digital wallet.",
      issueReady: "Option to Issue Permit as a Digital Credential.",
      pending:
        "The digital credential for this permit has already been offered to your digital wallet",
      active: "This digital credential has been accepted",
    },
    alertMessage: {
      noWallet:
        "Digital wallets must be connected in order to send and receive digital credentials. Please establish a digital wallet connection by clicking on the &apos;Generate Digital Wallet Connection&apos; button below.",
      issueReady: `Receive your permit as a digital credential by clicking the button below. A request will be sent to the Chief Permitting Officer of B.C. who will then issue your permit as a digital credential for you to review, accept, and store in the digital wallet of ${mineName}.`,
      pending: `Please review and verify this digital credential in the digital wallet of ${mineName}. If all data is accurate, accept the credential for it to be stored in your digital wallet.`,
      active: `Please review the details in the digital wallet of ${mineName}.`,
    },
    modalBody: {
      noWallet: null,
      issueReady: (
        <>
          <Typography.Paragraph>
            By generating this request, you are requesting your permit to be sent as a digital
            credential. Please monitor the digital wallet of {mineName} to review and accept any
            incoming offers being sent from the Chief Permitting Officer of B.C.&apos;s digital
            wallet.
          </Typography.Paragraph>
          <Typography.Paragraph strong>
            Click below to add permit {permit_no} to the digital wallet of {mineName}
          </Typography.Paragraph>
        </>
      ),
      pending: "",
      active: "",
    },
    issueButton: {
      issueReady: `Issue Digital Credential for permit ${permit_no}`,
      pending: `Digital Credential for permit ${permit_no} has been issued`,
      active: `Digital Credential for permit ${permit_no} accepted`,
    },
    credentialStatusText: {
      pending: (
        <>
          <ClockCircleOutlined />
          <Typography.Text>
            Credential has been offered. Please check your wallet to accept this credential offer.
          </Typography.Text>
        </>
      ),
      active: (
        <>
          <CheckCircleOutlined />
          <Typography.Text>
            Credential has been accepted. You can view it in your digital wallet.
          </Typography.Text>
        </>
      ),
    },
  };

  const contentKey = "issueReady";

  // switch to modal that generates connection
  const generateWalletConnection = (event) => {
    openVCWalletInvitationModal(
      event,
      current_permittee_guid,
      current_permittee,
      current_permittee_digital_wallet_connection_state
    );
  };

  return (
    <div>
      <Typography.Paragraph>
        <Alert
          message={content.alertTitle[contentKey]}
          description={content.alertMessage[contentKey]}
          type="info"
          showIcon
        />
      </Typography.Paragraph>
      {content.modalBody[contentKey]}
      {content.issueButton[contentKey] && (
        <Button
          type="primary"
          //   @ts-ignore TODO: ts-ignore only needed for testing with hardcoded value
          disabled={contentKey !== "issueReady"}
          className="margin-large--bottom"
        >
          {content.issueButton[contentKey]}
        </Button>
      )}
      {content.credentialStatusText[contentKey]}
      <Row className="padding-lg--y" style={{ justifyContent: "flex-end", gap: "1.5em" }}>
        {/* @ts-ignore TODO: ts-ignore only needed for testing with hardcoded value */}
        {contentKey === "noWallet" ? (
          <>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="primary" onClick={generateWalletConnection}>
              Generate Digital Wallet Connection
            </Button>
          </>
        ) : (
          <Button onClick={closeModal}>Close</Button>
        )}
      </Row>
    </div>
  );
};

export default IssuePermitDigitalCredential;
