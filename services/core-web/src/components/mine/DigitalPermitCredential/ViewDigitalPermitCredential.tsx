import "@ant-design/compatible/assets/index.css";

import { Alert, Button, Col, Row, Table, Typography } from "antd";
import {
  VC_ACTIVE_CONNECTION_STATES,
  VC_CONNECTION_STATES,
  VC_CRED_ISSUE_STATES,
} from "@mds/common";
import {
  IMine,
  IMineCommodityOption,
  IMineDisturbanceOption,
  IPermit,
} from "@mds/common/interfaces";
import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { formatDate } from "@mds/common/redux/utils/helpers";
import {
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { useSelector, useDispatch } from "react-redux";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import ExplosivesPermitMap from "@mds/common/components/explosivespermits/ExplosivesPermitMap";
import {
  getMineCommodityOptions,
  getMineDisturbanceOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import modalConfig from "@/components/modalContent/config";
import {
  fetchCredentialConnections,
  getCredentialConnections,
  revokeCredential,
} from "@mds/common/redux/slices/verifiableCredentialsSlice";

const { Paragraph, Title } = Typography;

const permitAmendmentLike = (permit: IPermit): any => ({
  permit_amendment_id: undefined,
  permit_amendment_guid: undefined,
  amendment_no: 0,
  ...permit,
});

export const ViewDigitalPermitCredential: FC = () => {
  const dispatch = useDispatch();
  const permits = useSelector((state) => getPermits(state));

  const { permitGuid, id: mineGuid } = useParams<{
    permitGuid: string;
    id: string;
  }>();

  const connectionDetails = useSelector((state) => getCredentialConnections(state));
  const digitalPermitCredential: IPermit = permits.find((p) => p.permit_guid === permitGuid);
  const mines = useSelector((state) => getMines(state));
  const mine: IMine = mines[mineGuid];

  const mineCommodityOptions: IMineCommodityOption[] = useSelector((state) =>
    getMineCommodityOptions(state)
  );

  const mineDisturbanceOptions: IMineDisturbanceOption[] = useSelector((state) =>
    getMineDisturbanceOptions(state)
  );

  useEffect(() => {
    if (digitalPermitCredential) {
      dispatch(
        fetchCredentialConnections({ partyGuid: digitalPermitCredential.current_permittee_guid })
      );
    }
  }, [digitalPermitCredential]);

  const getLatestIssueDate = () => {
    const latestAmendment = digitalPermitCredential?.permit_amendments?.filter(
      (a) => a.permit_amendment_status_code !== "DFT"
    )[0];

    return latestAmendment?.issue_date;
  };

  const permitHistoryColumns = [
    renderDateColumn("issue_date", "Issued"),
    renderDateColumn("authorization_end_date", "Expiry"),
    {
      key: "current_permittee_digital_wallet_connection_state",
      title: "Status",
      dataIndex: "current_permittee_digital_wallet_connection_state",
      render: (text) => <div>{VC_CONNECTION_STATES[text]}</div>,
    },
    renderTextColumn("amendment_no", "Issuance"),
  ];

  const transformPermitHistoryData = () => {
    const amendments = digitalPermitCredential?.permit_amendments
      ?.sort((a, b) => a.permit_amendment_id - b.permit_amendment_id)
      .map((a, index) => {
        return {
          ...a,
          amendment_no: index + 1,
        };
      });
    const permitHistory: any[] = [
      permitAmendmentLike(digitalPermitCredential),
      ...(amendments ?? []),
    ];

    return permitHistory.reverse();
  };

  const getCommodityDescriptionFromCode = (codes: string[]) => {
    const commodityDescription = mineCommodityOptions.reduce(
      (acc, option: IMineCommodityOption) => {
        if (codes?.includes(option.mine_commodity_code)) acc.push(option.description);
        return acc;
      },
      []
    );
    return commodityDescription.join(", ") ?? "";
  };

  const getMineDisturbanceFromCode = (codes: string[]) => {
    const disturbanceDescriptions = mineDisturbanceOptions.reduce(
      (acc, option: IMineDisturbanceOption) => {
        if (codes?.includes(option.mine_disturbance_code)) acc.push(option.description);
        return acc;
      },
      []
    );
    return disturbanceDescriptions.join(", ");
  };

  const handleRevoke = async (data) => {
    if (connectionDetails.length < 1) return;

    await dispatch(
      revokeCredential({
        partyGuid: digitalPermitCredential.current_permittee_guid,
        comment: data.comment,
        credential_exchange_id: connectionDetails[0].cred_exch_id,
      })
    );

    dispatch(closeModal());
  };

  const openRevokeDigitalCredentialModal = (event) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          initialValues: {},
          onSubmit: handleRevoke,
          title: "Revoke Digital Permit Credential",
          mineGuid,
        },
        width: "50vw",
        content: modalConfig.REVOKE_CREDENTIAL_MODAL,
      })
    );
  };

  console.log("mine", mine);

  return (
    <div className="tab__content margin-large--top">
      {VC_CRED_ISSUE_STATES[connectionDetails[0]?.cred_exch_state] ===
        VC_CRED_ISSUE_STATES.credential_revoked && (
        <Alert
          className="margin-large--bottom"
          description={
            <Row justify="space-between" align="middle">
              <Paragraph strong>This digital credential was revoked</Paragraph>
              <Button type="default" className="no-bg">
                Re-offer Credential
              </Button>
            </Row>
          }
          type="error"
          showIcon
        />
      )}
      <Title level={2}>Digital Permit Credential</Title>
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <Title level={3} className="primary-colour">
            Credential Details
          </Title>
          <>
            <Row gutter={6}>
              <Col span={12}>
                <Paragraph strong>Permittee Name</Paragraph>
                <Paragraph>{digitalPermitCredential?.current_permittee}</Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph strong>Issue Date</Paragraph>
                <Paragraph>{formatDate(getLatestIssueDate())}</Paragraph>
              </Col>
            </Row>
          </>

          <Row gutter={6}>
            <Col span={12}>
              <Paragraph strong>Permit Number</Paragraph>
              <Paragraph>{digitalPermitCredential?.permit_no}</Paragraph>
            </Col>

            <Col span={12}>
              <Paragraph strong>Mine Number</Paragraph>
              <Paragraph>{mine.mine_no}</Paragraph>
            </Col>
          </Row>
          <Row gutter={6} className="margin-large--bottom">
            <Col span={12}>
              <Paragraph strong>Latitude</Paragraph>
              <Paragraph>{mine.mine_location.latitude}</Paragraph>
            </Col>
            <Col span={12}>
              <Paragraph strong>Longitude</Paragraph>
              <Paragraph>{mine.mine_location.longitude}</Paragraph>
            </Col>
          </Row>
          <ExplosivesPermitMap pin={[mine.mine_location.latitude, mine.mine_location.longitude]} />
          <Row gutter={6} className="margin-large--top">
            <Col span={24}>
              <Paragraph strong>Mine Operation Status</Paragraph>
              <Paragraph>{mine.latest_mine_status.status_labels.join(", ")}</Paragraph>
            </Col>
            <Col span={24}>
              <Paragraph strong>Mine Operation Status Reason</Paragraph>
              <Paragraph>{mine.latest_mine_status.status_description}</Paragraph>
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={8}>
              <Paragraph>Mine Disturbance</Paragraph>
              <Paragraph>
                {getMineDisturbanceFromCode(
                  digitalPermitCredential?.site_properties.mine_disturbance_code
                )}
              </Paragraph>
            </Col>
            <Col span={8}>
              <Paragraph>Mine Commodity</Paragraph>
              <Paragraph>
                {getCommodityDescriptionFromCode(
                  digitalPermitCredential?.site_properties.mine_commodity_code
                )}
              </Paragraph>
            </Col>
            <Col span={8}>
              <Paragraph>Bond Total</Paragraph>
              <Paragraph>{digitalPermitCredential?.active_bond_total}</Paragraph>
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={24}>
              <Paragraph>TSF Operating Count</Paragraph>
              <Paragraph>
                {
                  mine.mine_tailings_storage_facilities.filter(
                    (tsf) => tsf.tsf_operating_status_code === "OPT"
                  ).length
                }
              </Paragraph>
            </Col>
            <Col span={24}>
              <Paragraph>TSF Care and Maintenance Count</Paragraph>
              <Paragraph>
                {
                  mine.mine_tailings_storage_facilities.filter(
                    (tsf) => tsf.tsf_operating_status_code === "CAM"
                  ).length
                }
              </Paragraph>
            </Col>
          </Row>
        </Col>
        <Col md={12} sm={24} className="border--left--layout">
          <>
            <Title level={3} className="primary-colour margin-large-bottom">
              Credential Status
            </Title>
            <Row>
              <Col
                span={
                  digitalPermitCredential?.current_permittee_digital_wallet_connection_state ===
                  "Inactive"
                    ? 12
                    : 24
                }
              >
                <Paragraph strong>Credential Status</Paragraph>
              </Col>
            </Row>
            <Row align="middle" justify="space-between">
              <Col span={8}>
                <Paragraph className="margin-none">
                  {VC_CRED_ISSUE_STATES[connectionDetails[0]?.cred_exch_state]}
                </Paragraph>
              </Col>
              <Col span={16}>
                {VC_ACTIVE_CONNECTION_STATES.includes(connectionDetails[0]?.cred_exch_state) && (
                  <Button
                    onClick={openRevokeDigitalCredentialModal}
                    type="ghost"
                    className="close-permit-button"
                  >
                    Revoke Credential
                  </Button>
                )}
              </Col>
            </Row>
            <Row align="middle" justify="space-between" className="margin-large--top">
              <Col>
                <Title level={3} className="purple margin-none">
                  Credential History
                </Title>
              </Col>
              <Col>
                <Button
                  type="ghost"
                  className="margin-large--left"
                  onClick={() => window.alert("This feature is not yet implemented.")}
                >
                  View History
                </Button>
              </Col>
            </Row>
            <Table
              rowKey={(rec) => rec.explosives_permit_amendment_guid ?? rec.explosives_permit_guid}
              dataSource={transformPermitHistoryData()}
              pagination={false}
              columns={permitHistoryColumns}
            />
          </>
        </Col>
      </Row>
    </div>
  );
};

export default ViewDigitalPermitCredential;
