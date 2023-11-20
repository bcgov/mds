import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography, Button, Badge } from "antd";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { fetchExplosivesPermits } from "@mds/common/redux/actionCreators/explosivesPermitActionCreator";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import PermitsTable from "@/components/dashboard/mine/permits/PermitsTable";
import {
  Feature,
  IExplosivesPermit,
  IMine,
  IPermit,
  VC_CONNECTION_STATES,
  isFeatureEnabled,
} from "@mds/common";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import modalConfig from "@/components/modalContent/config";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";

interface PermitsProps {
  mine: IMine;
  permits: IPermit[];
  explosivesPermits: IExplosivesPermit[];
  fetchPermits: ActionCreator<typeof fetchPermits>;
  fetchExplosivesPermits: ActionCreator<typeof fetchExplosivesPermits>;
  openDocument: (document_manager_guid: string, mine_document_guid: string) => void;
  openModal: (payload) => any;
  closeModal: (payload) => void;
}
export const Permits: FC<PermitsProps> = ({ mine, permits, explosivesPermits, ...props }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) {
      Promise.all([
        props.fetchPermits(mine.mine_guid),
        props.fetchExplosivesPermits(mine.mine_guid),
      ]).then(() => {
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
        title: "Generate Digital Wallet Connection Invitation",
        partyGuid: partyGuid,
        partyName: partyName,
        connectionState: connectionState,
      },
      content: modalConfig.VC_WALLET_INVITATION,
    });
  };

  const DigitalWalletSection = () => {
    // list of permittees from open permits with no duplicates
    const permittees: any[] = [];
    permits
      .filter((p) => p.permit_status_code === "O")
      .forEach((permit) => {
        if (!permittees.find((p) => p.current_permittee_guid === permit.current_permittee_guid)) {
          const permittee = {
            name: permit.current_permittee,
            current_permittee_guid: permit.current_permittee_guid,
            status: permit.current_permittee_digital_wallet_connection_state,
          };
          permittees.push(permittee);
        }
      });
    const colourMap = {
      Inactive: "#D8292F",
      Pending: "#F1C21B",
      Active: "#45A776",
    };

    const showDigitalWalletInfo = permittees.some(
      (p) => VC_CONNECTION_STATES[p.status] !== VC_CONNECTION_STATES.active
    );
    return (
      <>
        {showDigitalWalletInfo && (
          <div className="light-grey-background padding-md">
            <Typography.Title level={5}>Generate your digital wallet connection</Typography.Title>
            <Typography.Paragraph>
              A digital wallet is a digital version of a physical wallet that enables organizations
              to store, send and receive digital credentials. Digital credentials are
              cryptographically protected to prevent the data from being altered and are exchanged
              with digital wallets. Digital credentials enable mines to share data, certifications,
              and credentials with investors, purchasers, regulators and more securely and in
              seconds.{" "}
              <a
                href="https://digital.gov.bc.ca/learning/case-studies/energy-mines-digital-trust-pilot/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </a>
            </Typography.Paragraph>
          </div>
        )}

        <Typography.Title level={5}>Permittee Digital Wallet Connection Status</Typography.Title>
        {permittees.map((permittee) => (
          <Row
            style={{ maxWidth: 690, padding: "16px 8px" }}
            key={permittee.current_permittee_guid}
          >
            <Col span={8}>{permittee.name}</Col>
            <Col span={6}>
              <Badge
                color={colourMap[VC_CONNECTION_STATES[permittee.status]]}
                text={VC_CONNECTION_STATES[permittee.status]}
              />
            </Col>
            <Col span={10}>
              {VC_CONNECTION_STATES[permittee.status] === VC_CONNECTION_STATES.active ? (
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
                  Generate Connection Invitation
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
          The below table displays all of the <strong>permit applications</strong> associated with
          this mine.
          {mine.major_mine_ind && isFeatureEnabled(Feature.VERIFIABLE_CREDENTIALS) && (
            <>
              <Typography.Text>
                {" "}
                Major mines operators in B.C. can now use digital credentials to prove that they
                hold a valid Mines Act Permit from the Government of B.C.
              </Typography.Text>
              {isFeatureEnabled(Feature.VERIFIABLE_CREDENTIALS) && <DigitalWalletSection />}
            </>
          )}
        </Typography.Paragraph>
        <PermitsTable
          isLoaded={isLoaded}
          permits={permits}
          explosivesPermits={explosivesPermits}
          majorMineInd={mine.major_mine_ind}
          openVCWalletInvitationModal={openVCWalletInvitationModal}
        />
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  explosivesPermits: getExplosivesPermits(state),
});

const mapDispatchToProps = {
  fetchPermits,
  fetchExplosivesPermits,
  openModal,
  closeModal,
  openDocument,
};

export default connect(mapStateToProps, mapDispatchToProps)(Permits);
