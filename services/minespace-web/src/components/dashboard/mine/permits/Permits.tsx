import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography, Button } from "antd";

import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { openModal } from "@common/actions/modalActions";
import { getPermits } from "@common/selectors/permitSelectors";
import PermitsTable from "@/components/dashboard/mine/permits/PermitsTable";
import { Feature, IMine, IPermit, isFeatureEnabled } from "@mds/common";
import { ActionCreator } from "@/interfaces/actionCreator";
import { formatSnakeCaseToSentenceCase } from "@common/utils/helpers";
import modalConfig from "@/components/modalContent/config";

interface PermitsProps {
  mine: IMine;
  permits: IPermit[];
  fetchPermits: ActionCreator<typeof fetchPermits>;
  openModal: (payload) => any;
}
export const Permits: FC<PermitsProps> = ({ mine, permits, ...props }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) {
      props.fetchPermits(mine.mine_guid).then(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  const openVCWalletInvitationModal = (
    event,
    partyGuid: string,
    partyName: string,
    connectionState: string
  ) => {
    event.preventDefault();
    props.openModal({
      props: {
        title: "Digital Wallet Connection Invitation",
        partyGuid: partyGuid,
        partyName: partyName,
        connectionState: connectionState,
      },
      content: modalConfig.VC_WALLET_INVITATION,
    });
  };

  const DigitalWalletSection = () => {
    // only open permits
    const permittees: any[] = [];
    permits
      .filter((p) => p.permit_status_code === "O")
      .forEach((permit) => {
        // no duplicates
        if (!permittees.find((p) => p.current_permittee_guid === permit.current_permittee_guid)) {
          const permittee = {
            name: permit.current_permittee,
            isActive: permit.current_permittee_digital_wallet_connection_state === "active",
            current_permittee_guid: permit.current_permittee_guid,
            status: permit.current_permittee_digital_wallet_connection_state,
          };
          permittees.push(permittee);
        }
      });
    return (
      <>
        <div className="light-grey-background padding-md">
          <Typography.Title level={5}>Generate your digital wallet connection</Typography.Title>
          <Typography.Paragraph>
            A digital wallet is a digital version of a physical wallet that enables organizations to
            store, send and receive digital credentials. Digital credentials are cryptographically
            protected to prevent the data from being altered and are exchanged with digital wallets.
            Digital credentials enable mines to share data, certifications, and credentials with
            investors, purchasers, regulators and more securely and in seconds.{" "}
            <a
              href="https://digital.gov.bc.ca/learning/case-studies/energy-mines-digital-trust-pilot/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </Typography.Paragraph>
        </div>

        {permittees.map((permittee) => (
          <Row
            style={{ maxWidth: 690, padding: "16px 8px", gap: "32px" }}
            key={permittee.current_permittee_guid}
          >
            <Col>{permittee.name}</Col>
            <Col>{formatSnakeCaseToSentenceCase(permittee.status ?? "Inactive")}</Col>
            <Col>
              {permittee.isActive ? (
                <Button disabled type="primary">
                  Digital Wallet Connection: Active
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={(e) =>
                    openVCWalletInvitationModal(
                      e,
                      permittee.current_permittee_guid,
                      permittee.name,
                      permittee.status
                    )
                  }
                >
                  Generate Digital Wallet Connection
                </Button>
              )}
            </Col>
          </Row>
        ))}
      </>
    );
  };

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={4}>Permits</Typography.Title>

        <Typography.Paragraph>
          The below table displays all of the permit applications associated with this mine.
          {mine.major_mine_ind && isFeatureEnabled(Feature.VERIFIABLE_CREDENTIALS) && (
            <>
              <Typography.Text>
                Major mines operators in B.C. can now use digital credentials to prove that they
                hold a valid Mines Act Permit from the Government of B.C.
              </Typography.Text>
              <DigitalWalletSection />
            </>
          )}
        </Typography.Paragraph>
        <PermitsTable
          isLoaded={isLoaded}
          permits={permits}
          majorMineInd={mine.major_mine_ind}
          mineName={mine.mine_name}
          openVCWalletInvitationModal={openVCWalletInvitationModal}
        />
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({
  permits: getPermits(state),
});

const mapDispatchToProps = {
  fetchPermits,
  openModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(Permits);
