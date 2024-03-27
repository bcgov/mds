import { Alert, Button, Col, Row, Table, Typography } from "antd";
import {
  VC_ACTIVE_CREDENTIAL_STATES,
  VC_CONNECTION_STATES,
  VC_CRED_ISSUE_STATES,
} from "@mds/common/constants";
import { patchPermitVCLocked } from "@mds/common/redux/actionCreators/permitActionCreator";
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
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import ExplosivesPermitMap from "@mds/common/components/explosivespermits/ExplosivesPermitMap";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import {
  getMineCommodityOptions,
  getMineDisturbanceOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import modalConfig from "@/components/modalContent/config";
import {
  fetchCredentialConnections,
  getMinesActPermitIssuance,
  revokeCredential,
  fetchCredentialExchangeDetails,
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

  const mineCommodityOptions: IMineCommodityOption[] = useSelector(getMineCommodityOptions);

  const mineDisturbanceOptions: IMineDisturbanceOption[] = useSelector(getMineDisturbanceOptions);

  useEffect(() => {
    if (permitRecord) {
      dispatch(fetchCredentialConnections({ partyGuid: permitRecord.current_permittee_guid }));
    }
  }, [permitRecord]);

  const getLatestIssueDate = () => {
    const latestAmendment = permitRecord?.permit_amendments?.filter(
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
    const amendments = permitRecord?.permit_amendments
      ?.sort((a, b) => a.permit_amendment_id - b.permit_amendment_id)
      .map((a, index) => {
        return {
          ...a,
          amendment_no: index + 1,
        };
      });
    const permitHistory: any[] = [permitAmendmentLike(permitRecord), ...(amendments ?? [])];

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
                <Paragraph>{permitRecord?.current_permittee}</Paragraph>
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
              <Paragraph>{permitRecord?.permit_no}</Paragraph>
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
                {getMineDisturbanceFromCode(permitRecord?.site_properties.mine_disturbance_code)}
              </Paragraph>
            </Col>
            <Col span={8}>
              <Paragraph>Mine Commodity</Paragraph>
              <Paragraph>
                {getCommodityDescriptionFromCode(permitRecord?.site_properties.mine_commodity_code)}
              </Paragraph>
            </Col>
            <Col span={8}>
              <Paragraph>Bond Total</Paragraph>
              <Paragraph>{permitRecord?.active_bond_total}</Paragraph>
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
              <Col span={16}>
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
                  Credential History
                </Title>
              </Col>
              <Col>
                <Button
                  type="ghost"
                  className="margin-large--left"
                  onClick={() => {
                    dispatch(
                      fetchCredentialExchangeDetails({
                        partyGuid: permitRecord.current_permittee_guid,
                        credentialExchangeGuid: minesActPermitIssuance[0].cred_exch_id,
                      })
                    );
                  }}
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
