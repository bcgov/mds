import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import PropTypes from "prop-types";
import { Row, Col, Card, Descriptions, Typography } from "antd";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import {
  getMineRegionHash,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
  getEMLIContactTypesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getTransformedMineTypes } from "@mds/common/redux/selectors/mineSelectors";
import { getEMLIContactsByRegion } from "@mds/common/redux/selectors/minespaceSelector";
import WorkerInfoEmployee from "@/components/dashboard/mine/overview/WorkerInfoEmployee";
import { getUserInfo } from "@mds/common/redux/selectors/authenticationSelectors";
import CustomPropTypes from "@/customPropTypes";
import ContactCard from "@/components/common/ContactCard";
import MinistryContactItem from "@/components/dashboard/mine/overview/MinistryContactItem";
import * as Strings from "@/constants/strings";
import Map from "@/components/common/Map";
import MineWorkInformation from "./MineWorkInformation";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  EMLIcontactInfo: PropTypes.arrayOf(CustomPropTypes.EMLIContactInfo).isRequired,
};

const isPartyRelationshipActive = (pr) =>
  (!pr.end_date || moment(pr.end_date).add(1, "days") > new Date()) &&
  (!pr.start_date || Date.parse(pr.start_date) <= new Date());

const getMineManager = (partyRelationships) => {
  const mineManagers = partyRelationships
    ? partyRelationships.filter(
        (pr) => pr.mine_party_appt_type_code === "MMG" && isPartyRelationshipActive(pr)
      )
    : null;
  const mineManager = mineManagers && mineManagers.length > 0 ? mineManagers[0] : null;
  return mineManager;
};

export const Overview = (props) => (
  <Row gutter={[0, 16]}>
    <Col lg={{ span: 14 }} xl={{ span: 16 }}>
      <Typography.Title level={4}>Overview</Typography.Title>
      <Typography.Paragraph>
        This tab contains general information about your mine and important contacts at EMLI. The
        information is pulled from current Ministry resources. If anything is incorrect, please
        notify one of the Ministry contacts.
      </Typography.Paragraph>
      <Descriptions column={2} colon={false}>
        <Descriptions.Item span={2} label="Region">
          {props.mineRegionHash[props.mine.mine_region] || Strings.UNKNOWN}
        </Descriptions.Item>
        <Descriptions.Item label="Latitude">
          {(props.mine.mine_location && props.mine.mine_location.latitude) || Strings.UNKNOWN}
        </Descriptions.Item>
        <Descriptions.Item label="Longitude">
          {(props.mine.mine_location && props.mine.mine_location.longitude) || Strings.UNKNOWN}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="Operating Status">
          {(props.mine.mine_status &&
            props.mine.mine_status.length > 0 &&
            props.mine.mine_status[0].status_labels.join(", ")) ||
            Strings.UNKNOWN}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="Commodity">
          {props.transformedMineTypes &&
          props.transformedMineTypes.mine_commodity_code &&
          props.transformedMineTypes.mine_commodity_code.length > 0
            ? props.transformedMineTypes.mine_commodity_code
                .map((code) => props.mineCommodityOptionsHash[code])
                .join(", ")
            : Strings.UNKNOWN}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="Disturbance">
          {props.transformedMineTypes &&
          props.transformedMineTypes.mine_disturbance_code &&
          props.transformedMineTypes.mine_disturbance_code.length > 0
            ? props.transformedMineTypes.mine_disturbance_code
                .map((code) => props.mineDisturbanceOptionsHash[code])
                .join(", ")
            : Strings.UNKNOWN}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="Active Permits">
          {props.mine.mine_permit_numbers && props.mine.mine_permit_numbers.length > 0
            ? props.mine.mine_permit_numbers.join(", ")
            : Strings.NONE}
        </Descriptions.Item>
      </Descriptions>
      <div className="padding-md--top padding-md--bottom">
        <MineWorkInformation mineGuid={props.mine.mine_guid} />
      </div>
      <div className="padding-md--top padding-md--bottom">
        <WorkerInfoEmployee mine={props.mine} />
      </div>
      <Row gutter={[16, 16]}>
        <Col xl={11} xxl={11} md={24}>
          <ContactCard
            title="Mine Manager"
            partyRelationship={getMineManager(props.partyRelationships)}
            dateLabel="Mine Manager Since"
          />
        </Col>
      </Row>
    </Col>
    <Col lg={{ span: 9, offset: 1 }} xl={{ offset: 1, span: 7 }} md={24}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <div style={{ height: "200px" }}>
            <Map mine={props.mine} controls={false} />
          </div>
        </Col>
        {(props.mine.major_mine_ind && (
          <Col span={24}>
            <Card title="Ministry Contacts">
              {props.EMLIcontactInfo.map((contact) => (
                <MinistryContactItem contact={contact} key={contact.id} />
              ))}
            </Card>
          </Col>
        )) || [
          <Col span={24} key="regional">
            <Card title="Regional Ministry Contacts">
              {props.EMLIcontactInfo.filter(({ is_general_contact }) => !is_general_contact).map(
                (contact) => (
                  <MinistryContactItem contact={contact} key={contact.id} />
                )
              )}
            </Card>
          </Col>,
          <Col span={24} key="general">
            <Card title="General Ministry Contacts">
              {props.EMLIcontactInfo.filter(({ is_general_contact }) => is_general_contact).map(
                (contact) => (
                  <MinistryContactItem contact={contact} key={contact.id} />
                )
              )}
            </Card>
          </Col>,
        ]}
      </Row>
    </Col>
  </Row>
);

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  mineRegionHash: getMineRegionHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
  partyRelationships: getPartyRelationships(state),
  transformedMineTypes: getTransformedMineTypes(state),
  EMLIcontactInfo: getEMLIContactsByRegion(state),
  EMLIContactTypesHash: getEMLIContactTypesHash(state),
});

Overview.propTypes = propTypes;

export default connect(mapStateToProps)(Overview);
