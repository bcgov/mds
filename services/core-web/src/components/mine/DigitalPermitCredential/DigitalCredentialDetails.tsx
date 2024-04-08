import { Col, Row, Skeleton, Typography } from "antd";
import { formatDate } from "@mds/common/redux/utils/helpers";
import ExplosivesPermitMap from "@mds/common/components/explosivespermits/ExplosivesPermitMap";
import React, { FC } from "react";
import {
  DigitalCredentialPermit,
  IMine,
  IMineCommodityOption,
  IMineDisturbanceOption,
} from "@mds/common";
import {
  getMineCommodityOptions,
  getMineDisturbanceOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { useSelector } from "react-redux";

const { Title, Paragraph } = Typography;

interface DigitalCredentialDetailsProps {
  permitRecord: Partial<DigitalCredentialPermit>;
  mine: IMine;
}

const DigitalCredentialDetails: FC<DigitalCredentialDetailsProps> = ({ permitRecord, mine }) => {
  const mineCommodityOptions: IMineCommodityOption[] = useSelector(getMineCommodityOptions);
  const mineDisturbanceOptions: IMineDisturbanceOption[] = useSelector(getMineDisturbanceOptions);

  const getLatestIssueDate = () => {
    if (permitRecord.issue_date) return permitRecord.issue_date;
    const latestAmendment = permitRecord?.permit_amendments?.filter(
      (a) => a.permit_amendment_status_code !== "DFT"
    )[0];

    return latestAmendment?.issue_date;
  };

  const getCommodityDescriptionFromCode = (codes: string[]) => {
    const commodityDescription = mineCommodityOptions.reduce(
      (acc, option: IMineCommodityOption) => {
        if (codes?.includes(option.mine_commodity_code) || codes?.includes(option.description))
          acc.push(option.description);
        return acc;
      },
      []
    );
    return commodityDescription.join(", ") ?? "";
  };

  const getMineDisturbanceFromCode = (codes: string[]) => {
    const disturbanceDescriptions = mineDisturbanceOptions.reduce(
      (acc, option: IMineDisturbanceOption) => {
        if (codes?.includes(option.mine_disturbance_code) || codes?.includes(option.description))
          acc.push(option.description);
        return acc;
      },
      []
    );
    return disturbanceDescriptions.join(", ");
  };

  const latitude: number = permitRecord?.latitude ?? mine.mine_location.latitude;
  const longitude: number = permitRecord?.longitude ?? mine.mine_location.longitude;

  return (
    <div>
      {permitRecord ? (
        <div>
          <Title level={3} className="primary-colour">
            Permit Details
          </Title>
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
              <Paragraph>{latitude}</Paragraph>
            </Col>
            <Col span={12}>
              <Paragraph strong>Longitude</Paragraph>
              <Paragraph>{longitude}</Paragraph>
            </Col>
          </Row>
          <ExplosivesPermitMap pin={[latitude, longitude]} />
          <Row gutter={6} className="margin-large--top">
            <Col span={24}>
              <Paragraph strong>Mine Operation Status</Paragraph>
              <Paragraph>
                {permitRecord.mine_operation_status ??
                  mine.latest_mine_status.status_labels.join(", ")}
              </Paragraph>
            </Col>
            <Col span={24}>
              <Paragraph strong>Mine Operation Status Reason</Paragraph>
              <Paragraph>
                {permitRecord.mine_operation_status_reason ??
                  mine.latest_mine_status.status_description}
              </Paragraph>
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
                {permitRecord.tsf_operating_count ??
                  mine.mine_tailings_storage_facilities.filter(
                    (tsf) => tsf.tsf_operating_status_code === "OPT"
                  ).length}
              </Paragraph>
            </Col>
            <Col span={24}>
              <Paragraph>TSF Care and Maintenance Count</Paragraph>
              <Paragraph>
                {permitRecord.tsf_care_and_maintenance_count ??
                  mine.mine_tailings_storage_facilities.filter(
                    (tsf) => tsf.tsf_operating_status_code === "CAM"
                  ).length}
              </Paragraph>
            </Col>
          </Row>
        </div>
      ) : (
        <div>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      )}
    </div>
  );
};

export default DigitalCredentialDetails;
