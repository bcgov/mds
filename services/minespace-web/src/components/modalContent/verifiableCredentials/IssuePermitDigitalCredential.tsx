import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { Alert, Button, Row, Typography } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { ActionCreator } from "@/interfaces/actionCreator";
import { issueVCDigitalCredForPermit } from "@mds/common/redux/actionCreators/verifiableCredentialActionCreator";
import { IPermit, VC_CONNECTION_STATES, VC_CRED_ISSUE_STATES } from "@mds/common";

interface IssuePermitDigitalCredentialProps {
  closeModal: () => void;
  permit: IPermit;
  issuanceState: string;
  connectionState: string;
  permitAmendmentGuid: string;
  openVCWalletInvitationModal: (
    event,
    partyGuid: string,
    partyName: string,
    connectionState: string
  ) => void;
  issueVCDigitalCredForPermit: ActionCreator<typeof issueVCDigitalCredForPermit>;
}

export const IssuePermitDigitalCredential: FC<IssuePermitDigitalCredentialProps> = ({
  permit,
  issuanceState,
  connectionState,
  permitAmendmentGuid,
  closeModal,
  openVCWalletInvitationModal,
  ...props
}) => {
  const {
    permit_no,
    current_permittee,
    current_permittee_digital_wallet_connection_state,
    current_permittee_guid,
  } = permit;

  const [loading, setLoading] = useState(false);

  const hasWallet = VC_CONNECTION_STATES[connectionState] === VC_CONNECTION_STATES.active;
  let contentKey = "noWallet";
  if (hasWallet) {
    switch (VC_CRED_ISSUE_STATES[issuanceState]) {
      case VC_CRED_ISSUE_STATES.credential_acked:
        contentKey = "active";
        break;
      case VC_CRED_ISSUE_STATES.offer_sent:
        contentKey = "pending";
        break;
      default:
        contentKey = "issueReady";
    }
  }

  // switch to modal that generates connection
  const generateWalletConnection = (event) => {
    openVCWalletInvitationModal(
      event,
      current_permittee_guid,
      current_permittee,
      current_permittee_digital_wallet_connection_state
    );
  };

  const issueVC = () => {
    setLoading(true);
    props.issueVCDigitalCredForPermit(current_permittee_guid, permitAmendmentGuid).then(() => {
      setLoading(false);
      closeModal();
    });
  };

  const content = {
    alertTitle: {
      noWallet:
        "Your digital wallet needs to be set up before you can add this permit to your digital wallet.",
      issueReady: "Option to Issue Permit as a Digital Credential.",
      pending:
        "The digital credential for this permit has already been offered to your digital wallet.",
      active: "This digital credential has been accepted.",
    },
    alertMessage: {
      noWallet:
        "Digital wallets must be connected in order to send and receive digital credentials. Please establish a digital wallet connection by clicking on the 'Generate Digital Wallet Connection' button below.",
      issueReady: `Receive your permit as a digital credential by clicking the button below. A request will be sent to the Chief Permitting Officer of B.C. who will then issue your permit as a digital credential for you to review, accept, and store in the digital wallet of ${current_permittee}.`,
      pending: `Please review and verify this digital credential in the digital wallet of ${current_permittee}. If all data is accurate, accept the credential for it to be stored in your digital wallet.`,
      active: `Please review the details in the digital wallet of ${current_permittee}.`,
    },
    modalBody: {
      noWallet: null,
      issueReady: (
        <>
          <Typography.Paragraph>
            By generating this request, you are requesting your permit to be sent as a digital
            credential. Please monitor the digital wallet of {current_permittee} to review and
            accept any incoming offers being sent from the Chief Permitting Officer of B.C.&apos;s
            digital wallet.
          </Typography.Paragraph>
          <Typography.Paragraph strong>
            Click below to add permit {permit_no} to the digital wallet of {current_permittee}
          </Typography.Paragraph>
        </>
      ),
    },
    issueButton: {
      issueReady: `Issue Digital Credential for permit ${permit_no}`,
      pending: `Digital Credential for permit ${permit_no} has been issued`,
      active: `Digital Credential for permit ${permit_no} accepted`,
    },
    credentialStatusText: {
      pending: (
        <div>
          <ClockCircleOutlined style={{ marginRight: "10px", fontSize: "24px" }} />
          <Typography.Text>
            Credential has been offered. Please check your wallet to accept this credential offer.
          </Typography.Text>
        </div>
      ),
      active: (
        <div>
          <CheckCircleOutlined style={{ marginRight: "10px", fontSize: "24px" }} />
          <Typography.Text>
            Credential has been accepted. Please review the details in the digital wallet of{" "}
            {current_permittee}.
          </Typography.Text>
        </div>
      ),
    },
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
          disabled={contentKey !== "issueReady"}
          onClick={issueVC}
          className="margin-large--bottom"
          loading={loading}
        >
          {content.issueButton[contentKey]}
        </Button>
      )}
      {content.credentialStatusText[contentKey]}
      <Row className="padding-lg--y" style={{ justifyContent: "flex-end", gap: "1.5em" }}>
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

const mapDispatchToProps = {
  issueVCDigitalCredForPermit,
};
export default connect(null, mapDispatchToProps)(IssuePermitDigitalCredential);
