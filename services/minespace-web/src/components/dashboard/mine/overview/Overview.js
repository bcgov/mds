import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
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
import * as Strings from "@/constants/strings";
import * as Contacts from "@/constants/contacts";

const { Paragraph, Text, Title } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
};

const isPartyRelationshipActive = (pr) =>
  (!pr.end_date || moment(pr.end_date).add(1, "days") > new Date()) &&
  (!pr.start_date || Date.parse(pr.start_date) <= new Date());

export class Overview extends Component {
  state = {
    contacts: {},
  };

  componentWillMount() {
    this.setState({ contacts: Contacts.MINISTRY_CONTACTS[this.props.mine.mine_region] });
  }

  render() {
    // Get the mine manager (which can, but shouldn't, be null).
    const mineManagers = this.props.partyRelationships
      ? this.props.partyRelationships.filter(
          (pr) => pr.mine_party_appt_type_code === "MMG" && isPartyRelationshipActive(pr)
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
            <Descriptions.Item span={2} label="Active Permits">
              {this.props.mine.mine_permit_numbers && this.props.mine.mine_permit_numbers.length > 0
                ? this.props.mine.mine_permit_numbers.join(", ")
                : Strings.NONE}
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
              {// There is only one contact who doesn't have a name, so conditionally render this field.
              this.state.contacts.permitting.name && (
                <Text>
                  {this.state.contacts.permitting.name}
                  <br />
                </Text>
              )}
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
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
  partyRelationships: getPartyRelationships(state),
  transformedMineTypes: getTransformedMineTypes(state),
});

Overview.propTypes = propTypes;

export default connect(mapStateToProps, null)(Overview);
