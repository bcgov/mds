// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col, Card, Descriptions, Typography } from "antd";
import {
  updateMineRecord,
  createMineTypes,
  removeMineType,
  fetchMineRecordById,
} from "@common/actionCreators/mineActionCreator";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import {
  getPartyRelationshipTypes,
  getPartyRelationships,
} from "@common/selectors/partiesSelectors";
import { getPermits } from "@common/reducers/permitReducer";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
} from "@common/selectors/staticContentSelectors";
import { getCurrentMineTypes, getTransformedMineTypes } from "@common/selectors/mineSelectors";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import CustomPropTypes from "@/customPropTypes";
import ContactCard from "@/components/common/ContactCard";
import * as Strings from "@/constants/strings";
import * as Contacts from "@/constants/contacts";

const { Paragraph, Text, Title } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  createMineTypes: PropTypes.func.isRequired,
  removeMineType: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.partyRelationshipType),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
};

const isActive = (pr) =>
  (!pr.end_date || moment(pr.end_date).add(1, "days") > new Date()) &&
  (!pr.start_date || Date.parse(pr.start_date) <= new Date());

export class Overview extends Component {
  state = {
    contacts: {},
  };

  componentWillMount() {
    this.setState({ contacts: Contacts.MINISTRY_CONTACTS[this.props.mine.mine_region] });
    this.props.fetchPermits(this.props.mine.mine_guid);
  }

  render() {
    console.log(this.props);
    // Get the mine's mine manager.
    const mineManagers = this.props.partyRelationships
      ? this.props.partyRelationships.filter(
          (pr) => pr.mine_party_appt_type_code === "MMG" && isActive(pr)
        )
      : null;
    const mineManager = mineManagers && mineManagers.length > 0 ? mineManagers[0].party : null;

    return (
      <Row>
        <Col lg={{ span: 14 }} xl={{ span: 16 }}>
          <Title level={4}>Overview</Title>
          <Paragraph>
            This tab contains general information about your mine and important contacts at EMPR.
            The information is pulled from current Ministry resources. If anything is incorrect,
            please notify one of the Ministry contacts.
          </Paragraph>
          <Descriptions column={2} colon={false}>
            <Descriptions.Item span={2} label="Region">
              {this.props.mineRegionHash[this.props.mine.mine_region] || Strings.UNKNOWN}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Coordinate">
              {(this.props.mine.mine_location &&
                `${this.props.mine.mine_location.latitude},${this.props.mine.mine_location.longitude}`) ||
                Strings.UNKNOWN}
            </Descriptions.Item> */}
            <Descriptions.Item label="Latitude">
              {(this.props.mine.mine_location && this.props.mine.mine_location.latitude) ||
                Strings.UNKNOWN}
            </Descriptions.Item>
            <Descriptions.Item label="Longitude">
              {(this.props.mine.mine_location && this.props.mine.mine_location.longitude) ||
                Strings.UNKNOWN}
            </Descriptions.Item>
            <Descriptions.Item span={2} label="Operating Status">
              {(this.props.mine.mine_status &&
                this.props.mine.mine_status.length > 0 &&
                this.props.mine.mine_status[0].status_labels.join(", ")) ||
                Strings.UNKNOWN}
            </Descriptions.Item>
            <Descriptions.Item span={2} label="Commodity">
              {this.props.transformedMineTypes.mine_commodity_code &&
              this.props.transformedMineTypes.mine_commodity_code.length > 0
                ? this.props.transformedMineTypes.mine_commodity_code
                    .map((code) => this.props.mineCommodityOptionsHash[code])
                    .join(", ")
                : Strings.UNKNOWN}
            </Descriptions.Item>
            <Descriptions.Item span={2} label="Disturbance">
              {this.props.transformedMineTypes.mine_disturbance_code &&
              this.props.transformedMineTypes.mine_disturbance_code.length > 0
                ? this.props.transformedMineTypes.mine_disturbance_code
                    .map((code) => this.props.mineDisturbanceOptionsHash[code])
                    .join(", ")
                : Strings.UNKNOWN}
            </Descriptions.Item>
            <Descriptions.Item span={2} label="Permits">
              {this.props.minePermits && this.props.minePermits.length > 0
                ? this.props.minePermits.map((permit) => permit.permit_no).join(", ")
                : Strings.UNKNOWN}
            </Descriptions.Item>
          </Descriptions>
          <Row>
            <Col xl={{ span: 11 }} xxl={{ span: 10 }}>
              <ContactCard
                title="Mine Manager"
                party={mineManager}
                dateLabel="Mine Manager Since"
              />
            </Col>
            {/* Disabled until we find a replacement contact to fill this card */}
            {/* <Col xl={{ span: 11, offset: 2 }} xxl={{ span: 10, offset: 2 }}>
              <ContactCard title="Permittee" party={null} dateLabel="Permittee Since" />
            </Col> */}
          </Row>
        </Col>
        <Col lg={{ span: 9, offset: 1 }} xl={{ offset: 1, span: 7 }}>
          <Card title="Regional Ministry Contacts">
            <Paragraph>
              <Text strong className="ministry-contact-title">
                Senior Health, Safety and Environment Inspector
              </Text>
              <br />
              <Text>{this.state.contacts.safety.name}</Text>
              <br />
              <Text>{this.state.contacts.safety.phone}</Text>
              <br />
              <Text>
                <a href={`mailto:${this.state.contacts.safety.email}`}>
                  {this.state.contacts.safety.email}
                </a>
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong className="ministry-contact-title">
                Senior Permitting Inspector
              </Text>
              <br />
              <Text>{this.state.contacts.permitting.name}</Text>
              <br />
              <Text>{this.state.contacts.permitting.phone}</Text>
              <br />
              <Text>
                <a href={`mailto:${this.state.contacts.permitting.email}`}>
                  {this.state.contacts.permitting.email}
                </a>
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong className="ministry-contact-title">
                Regional Director
              </Text>
              <br />
              <Text>{this.state.contacts.director.name}</Text>
              <br />
              <Text>{this.state.contacts.director.phone}</Text>
              <br />
              <Text>
                <a href={`mailto:${this.state.contacts.director.email}`}>
                  {this.state.contacts.director.email}
                </a>
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong className="ministry-contact-title">
                Regional Office
              </Text>
              <br />
              <Text>{this.state.contacts.office.phone}</Text>
              <br />
              <Text>
                <a href={`mailto:${this.state.contacts.office.email}`}>
                  {this.state.contacts.office.email}
                </a>
              </Text>
            </Paragraph>
          </Card>
          <Card title="General Ministry Contacts">
            {this.props.mine.major_mine_ind && (
              <Paragraph>
                <Text strong className="ministry-contact-title">
                  Major Mines Office
                </Text>
                <br />
                <Text>
                  <a href={`mailto:${Contacts.MM_OFFICE.email}`}>{Contacts.MM_OFFICE.email}</a>
                </Text>
              </Paragraph>
            )}
            <Paragraph>
              <Text strong className="ministry-contact-title">
                Chief Inspector of Mines
              </Text>
              <br />
              <Text>{Contacts.CHIEF_INSPECTOR.name}</Text>
              <br />
              <Text>{Contacts.CHIEF_INSPECTOR.phone}</Text>
              <br />
              <Text>
                <a href={`mailto:${Contacts.CHIEF_INSPECTOR.email}`}>
                  {Contacts.CHIEF_INSPECTOR.email}
                </a>
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong className="ministry-contact-title">
                Executive Lead (Authorizations)
              </Text>
              <br />
              <Text>{Contacts.EXEC_LEAD_AUTH.name}</Text>
              <br />
              <Text>{Contacts.EXEC_LEAD_AUTH.phone}</Text>
              <br />
              <Text>
                <a href={`mailto:${Contacts.EXEC_LEAD_AUTH.email}`}>
                  {Contacts.EXEC_LEAD_AUTH.email}
                </a>
              </Text>
            </Paragraph>
          </Card>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
  partyRelationships: getPartyRelationships(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  minePermits: getPermits(state),
  currentMineTypes: getCurrentMineTypes(state),
  transformedMineTypes: getTransformedMineTypes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateMineRecord,
      createMineTypes,
      removeMineType,
      fetchMineRecordById,
      fetchPermits,
    },
    dispatch
  );

Overview.propTypes = propTypes;
Overview.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
