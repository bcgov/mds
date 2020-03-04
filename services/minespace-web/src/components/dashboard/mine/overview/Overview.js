import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import PropTypes from "prop-types";
import { Row, Col, Card, Descriptions, Typography } from "antd";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import {
  getMineRegionHash,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
} from "@common/selectors/staticContentSelectors";
import { getTransformedMineTypes } from "@common/selectors/mineSelectors";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import CustomPropTypes from "@/customPropTypes";
import ContactCard from "@/components/common/ContactCard";
import MinistryContactItem from "@/components/dashboard/mine/overview/MinistryContactItem";
import * as Strings from "@/constants/strings";
import * as Contacts from "@/constants/contacts";
import Map from "@/components/common/Map";

const { Paragraph, Title } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
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
  const mineManager = mineManagers && mineManagers.length > 0 ? mineManagers[0].party : null;
  return mineManager;
};

const getRegionalMineRegionalContacts = (region) =>
  Object.values(Contacts.REGIONAL_MINE_REGIONAL_CONTACTS[region]);

const getMajorMineRegionalContacts = (region) =>
  Object.values(Contacts.MAJOR_MINE_REGIONAL_CONTACTS[region]);

export const Overview = (props) => (
  <Row gutter={[0, 16]}>
    <Col lg={{ span: 14 }} xl={{ span: 16 }}>
      <Title level={4}>Overview</Title>
      <Paragraph>
        This tab contains general information about your mine and important contacts at EMPR. The
        information is pulled from current Ministry resources. If anything is incorrect, please
        notify one of the Ministry contacts.
      </Paragraph>
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
      <Row gutter={[16, 16]}>
        <Col xl={{ span: 11 }} xxl={{ span: 10 }}>
          <ContactCard
            title="Mine Manager"
            party={getMineManager(props.partyRelationships)}
            dateLabel="Mine Manager Since"
          />
        </Col>
      </Row>
    </Col>
    <Col lg={{ span: 9, offset: 1 }} xl={{ offset: 1, span: 7 }}>
      <Row gutter={[0, 16]}>
        <Col>
          <div style={{ height: "200px" }}>
            <Map mine={props.mine} controls={false} />
          </div>
        </Col>
        {(props.mine.major_mine_ind && (
          <Col>
            <Card title="Ministry Contacts">
              <MinistryContactItem contact={Contacts.MM_OFFICE} />
              <MinistryContactItem contact={Contacts.CHIEF_INSPECTOR} />
              <MinistryContactItem contact={Contacts.EXEC_LEAD_AUTH} />
              {getMajorMineRegionalContacts(props.mine.mine_region).map((contact) => (
                <MinistryContactItem contact={contact} key={contact.title} />
              ))}
            </Card>
          </Col>
        )) || [
          <Col>
            <Card title="Regional Ministry Contacts">
              {getRegionalMineRegionalContacts(props.mine.mine_region).map((contact) => (
                <MinistryContactItem contact={contact} key={contact.title} />
              ))}
            </Card>
          </Col>,
          <Col>
            <Card title="General Ministry Contacts">
              <MinistryContactItem contact={Contacts.CHIEF_INSPECTOR} />
              <MinistryContactItem contact={Contacts.EXEC_LEAD_AUTH} />
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
});

Overview.propTypes = propTypes;

export default connect(mapStateToProps)(Overview);
