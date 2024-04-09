import { Alert, Button, Col, Row, Table, Typography } from "antd";
import { VC_ACTIVE_CREDENTIAL_STATES, VC_CRED_ISSUE_STATES } from "@mds/common/constants";
import {
  fetchPermits,
  patchPermitVCLocked,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { IMine, IPermit } from "@mds/common/interfaces";
import React, { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { renderDateColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { useDispatch, useSelector } from "react-redux";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import modalConfig from "@/components/modalContent/config";
import {
  fetchCredentialConnections,
  getMinesActPermitIssuance,
  revokeCredential,
} from "@mds/common/redux/slices/verifiableCredentialsSlice";
import DigitalCredentialDetails from "@/components/mine/DigitalPermitCredential/DigitalCredentialDetails";

const { Paragraph, Title } = Typography;

export const ViewDigitalPermitCredential: FC = () => {
  const dispatch = useDispatch();
  const permits = useSelector(getPermits);

  const { permitGuid, id: mineGuid } = useParams<{
    permitGuid: string;
    id: string;
  }>();

  const minesActPermitIssuance = useSelector((state) => getMinesActPermitIssuance(state));
  const permitRecord: IPermit = permits.find((p) => p.permit_guid === permitGuid);
  const activePermitCredential = minesActPermitIssuance.find((mapi) =>
    VC_ACTIVE_CREDENTIAL_STATES.includes(mapi.cred_exch_state)
  );
  const mine: IMine = useSelector((state) => getMineById(state, mineGuid));

  useEffect(() => {
    if (permitRecord) {
      dispatch(fetchCredentialConnections({ partyGuid: permitRecord.current_permittee_guid }));
    }
  }, [permitRecord]);

  const openCredentialContentsModal = (event, cred_exch_id) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          title: "Digital Credential Details",
          partyGuid: minesActPermitIssuance[0].party_guid,
          credExchId: cred_exch_id,
          mine,
        },
        width: "50vw",
        content: modalConfig.CREDENTIAL_CONTENT_MODAL,
      })
    );
  };

  const permitHistoryColumns = [
    {
      title: "Credential Type",
      render: () => "AnonCreds",
    },
    renderDateColumn("last_webhook_timestamp", "Last Updated"),
    {
      title: "Status",
      key: "cred_exch_state",
      dataIndex: "cred_exch_state",
      render: (text) => VC_CRED_ISSUE_STATES[text],
    },
    {
      key: "details",
      title: "Details",
      dataIndex: "cred_exch_id",
      render: (text) => (
        <Button onClick={(event) => openCredentialContentsModal(event, text)}> View </Button>
      ),
    },
  ];

  const handleRevoke = async (data) => {
    if (!activePermitCredential) return;

    await dispatch(
      revokeCredential({
        partyGuid: permitRecord.current_permittee_guid,
        comment: data.comment,
        credential_exchange_id: activePermitCredential.cred_exch_id,
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

  const releasePermitVCLock = (event) => {
    event.preventDefault();
    dispatch(
      patchPermitVCLocked(permitRecord.permit_guid, mineGuid, {
        mines_act_permit_vc_locked: false,
      })
    ).then(() => {
      dispatch(fetchPermits(mineGuid));
    });
  };

  return (
    <div className="tab__content margin-large--top">
      {VC_CRED_ISSUE_STATES[
        minesActPermitIssuance[minesActPermitIssuance.length - 1]?.cred_exch_state
      ] === VC_CRED_ISSUE_STATES.credential_revoked &&
        permitRecord.mines_act_permit_vc_locked && (
          <Alert
            className="margin-large--bottom"
            description={
              <Row justify="space-between" align="middle">
                <Paragraph strong>This digital credential was revoked</Paragraph>
                <Button type="default" className="no-bg" onClick={releasePermitVCLock}>
                  Make Available
                </Button>
              </Row>
            }
            type="error"
            showIcon
          />
        )}
      <Title level={2}>Permit {permitRecord?.permit_no}</Title>
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <DigitalCredentialDetails permitRecord={permitRecord} mine={mine} />
        </Col>
        <Col md={12} sm={24} className="border--left--layout">
          <>
            <Title level={3} className="primary-colour margin-large-bottom">
              Digital Credential Status
            </Title>
            <Row>
              <Col
                span={
                  permitRecord?.current_permittee_digital_wallet_connection_state === "Inactive"
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
                  {VC_CRED_ISSUE_STATES[activePermitCredential?.cred_exch_state] ??
                    VC_CRED_ISSUE_STATES[
                      minesActPermitIssuance[minesActPermitIssuance.length - 1]?.cred_exch_state
                    ] ??
                    "No Credential Issued"}
                </Paragraph>
              </Col>
              <Col xs={16} lg={10}>
                {activePermitCredential && (
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
                  Digital Credential History
                </Title>
              </Col>
            </Row>
            <Table
              rowKey={(rec) => rec.explosives_permit_amendment_guid ?? rec.explosives_permit_guid}
              dataSource={minesActPermitIssuance}
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
