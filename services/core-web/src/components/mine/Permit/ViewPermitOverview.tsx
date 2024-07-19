import React, { useMemo } from "react";
import { Button, Col, Divider, Row, Skeleton, Table, Typography } from "antd";
import {
  IExemptionFeeStatusOption,
  IMine,
  IMineCommodityOption,
  IMineDisturbanceOption,
  IMineTenureType,
  IPermit,
  IPermitAmendmentDocument,
  IPermitStatusOption,
  IPermitTypeOption,
} from "@mds/common";
import { useParams } from "react-router-dom";
import { getPermitByGuid } from "@mds/common/redux/selectors/permitSelectors";
import { useSelector } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { findOptionDescription, getDescriptionsFromCodes } from "@mds/common/redux/utils/helpers";
import {
  getExemptionFeeStatusOptions,
  getMineCommodityOptions,
  getMineDisturbanceOptions,
  getMineTenureTypeOptions,
  getPermitStatusOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getPermitAmendmentTypeOptions } from "@mds/common/redux/reducers/staticContentReducer";
import {
  renderDocumentLinkColumn,
  uploadedByColumn,
} from "@mds/common/components/documents/DocumentColumns";
import { renderDateColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { ColumnsType } from "antd/es/table";

const { Title, Paragraph } = Typography;

const ViewPermitOverview = () => {
  const mineCommodityOptions: IMineCommodityOption[] = useSelector(getMineCommodityOptions);
  const mineDisturbanceOptions: IMineDisturbanceOption[] = useSelector(getMineDisturbanceOptions);
  const exemptionFeeStatusOptions: IExemptionFeeStatusOption[] = useSelector(
    getExemptionFeeStatusOptions
  );
  const permitStatusOptions: IPermitStatusOption[] = useSelector(getPermitStatusOptions);
  const permitTypeOptions: IPermitTypeOption[] = useSelector(getPermitAmendmentTypeOptions);
  const mineTenureTypeOptions: IMineTenureType[] = useSelector(getMineTenureTypeOptions);

  const { id, permitGuid } = useParams<{ id: string; permitGuid: string }>();
  const permit: IPermit = useSelector(getPermitByGuid(permitGuid));
  const mine: IMine = useSelector((state) => getMineById(state, id));

  const latestAmendment = useMemo(() => {
    if (!permit) return undefined;
    return permit.permit_amendments[permit.permit_amendments.length - 1];
  }, [permit]);

  const documentColumns: ColumnsType<IPermitAmendmentDocument> = [
    renderDocumentLinkColumn("document_name", "File Name", true),
    uploadedByColumn("create_user", "Created By"),
    renderDateColumn("create_timestamp", "Updated"),
  ];

  return (
    <div className="view-permits-content">
      <Row justify="space-between" align="middle">
        <Col>
          <Title className="margin-none padding-lg--top padding-lg--bottom" level={2}>
            Permit Overview
          </Title>
        </Col>
        <Col>
          <Button type="primary">Edit Permit</Button>
        </Col>
      </Row>
      {permit && mine ? (
        <Row>
          <Col span={12} className="view-permits-detail-section">
            <Title level={4}>Permit Details</Title>
            <Row>
              <Col span={12}>
                <Paragraph strong>Issue Date</Paragraph>
                <Paragraph>{formatDate(latestAmendment.issue_date)}</Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph strong>Authorization End Date</Paragraph>
                <Paragraph>{formatDate(latestAmendment.authorization_end_date)}</Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Paragraph strong>Permitee</Paragraph>
                <Paragraph>{permit.current_permittee}</Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Paragraph strong>Permit Type</Paragraph>
                <Paragraph>
                  {findOptionDescription(
                    permitTypeOptions,
                    "permit_amendment_type_code",
                    latestAmendment.permit_amendment_type_code
                  )}
                </Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph strong>Permit Number</Paragraph>
                <Paragraph>{permit.permit_no}</Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Paragraph strong>Tenure</Paragraph>
                <Paragraph>
                  {getDescriptionsFromCodes(
                    mine.mine_type.map((t) => t.mine_tenure_type_code),
                    mineTenureTypeOptions,
                    "mine_tenure_type_code"
                  )}
                </Paragraph>
                {/*<Paragraph>{findOptionDescription(mineTenureTypeOptions, 'mine_tenure_type_code', mine.mine_type[0].)}</Paragraph>*/}
              </Col>
              <Col span={12}>
                <Paragraph strong>Commodity</Paragraph>
                <Paragraph>
                  {getDescriptionsFromCodes(
                    permit.site_properties.mine_commodity_code,
                    mineCommodityOptions,
                    "mine_commodity_code"
                  )}
                </Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Paragraph strong>Disturbance</Paragraph>
                <Paragraph>
                  {getDescriptionsFromCodes(
                    permit?.site_properties.mine_disturbance_code,
                    mineDisturbanceOptions,
                    "mine_disturbance_code"
                  )}
                </Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph strong>Inspection Fee Status</Paragraph>
                <Paragraph>
                  {findOptionDescription(
                    exemptionFeeStatusOptions,
                    "exemption_fee_status_code",
                    permit.exemption_fee_status_code
                  )}
                </Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Paragraph strong>Fee Exemption Note</Paragraph>
                <Paragraph>{permit.exemption_fee_status_note ?? "-"}</Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Paragraph strong>Description</Paragraph>
                <Paragraph>{latestAmendment.description}</Paragraph>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col span={12}>
                <Paragraph strong>Security</Paragraph>
                <Paragraph>${permit.assessed_liability_total.toFixed(2)}</Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph strong>Security Received</Paragraph>
                <Paragraph>
                  {latestAmendment.security_received_date
                    ? formatDate(latestAmendment.security_received_date)
                    : "-"}
                </Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Paragraph strong>Assessed Liability Adjustment</Paragraph>
                <Paragraph>${latestAmendment.liability_adjustment ?? "-"}</Paragraph>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col span={24}>
                <Paragraph strong>Tailings Storage Facility Operating Count</Paragraph>
                <Paragraph>
                  {
                    mine.mine_tailings_storage_facilities.filter(
                      (tsf) => tsf.tsf_operating_status_code === "OPT"
                    ).length
                  }
                </Paragraph>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Paragraph strong>Tailings Storage Facility Care and Maintenance Count</Paragraph>
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
          <Col span={12} className="view-permits-detail-section">
            <Title level={4}>Permit Status</Title>
            <Row>
              <Col span={12}>
                <Paragraph strong>Permit Status</Paragraph>
                <Paragraph>
                  {findOptionDescription(
                    permitStatusOptions,
                    "permit_status_code",
                    permit.permit_status_code
                  )}
                </Paragraph>
              </Col>
              {permit.permit_status_code === "C" && (
                <Col span={12}>
                  <Paragraph strong>Date Closed</Paragraph>
                  <Paragraph>{formatDate(permit?.status_changed_timestamp)}</Paragraph>
                </Col>
              )}
            </Row>
            <Row>
              <Col span={24}>
                <Paragraph strong>Remaining Outstanding Liability Amount (if any)</Paragraph>
                <Paragraph>{permit.remaining_static_liability ?? "-"}</Paragraph>
              </Col>
            </Row>
            <Row justify="space-between">
              <Col span={12}>
                <Paragraph>Updated by: {permit.update_user}</Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph>Updated Date: {formatDate(permit.update_timestamp)}</Paragraph>
              </Col>
            </Row>
            <Title level={4} className="margin-large--top">
              Permit Documents
            </Title>
            <Paragraph>
              Please upload any documents that support this permit. Documents uploaded here will be
              viewable by Minespace users.
            </Paragraph>
            <Table
              className="margin-large--top"
              dataSource={latestAmendment.related_documents}
              columns={documentColumns}
              pagination={false}
            />
          </Col>
        </Row>
      ) : (
        <Skeleton />
      )}
    </div>
  );
};

export default ViewPermitOverview;
