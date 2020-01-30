// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Descriptions, Typography, Alert } from "antd";
import CustomPropTypes from "@/customPropTypes";
import ContactCard from "@/components/common/ContactCard";
import * as Strings from "@/constants/strings";
import * as Contacts from "@/constants/contacts";

const { Paragraph, Text, Title } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {};

// Test data
const partyMineManager = {
  name: "John Bernard Smith",
  email: "j.b.smith@gmail.com",
  phone: "(250) 938-2948",
  date: "December 10, 2019",
};
const partyPermittee = {
  name: "Abe Jimmy Jones",
  email: "a.j.jones@gmail.com",
  phone: "(250) 479-2535",
  date: "September 12, 2018",
};

export class Overview extends Component {
  state = {
    contacts: {},
  };

  componentWillMount() {
    this.setState({ contacts: Contacts.MINISTRY_CONTACTS[this.props.mine.mine_region] });
  }

  render() {
    return (
      <Row>
        <Col lg={{ span: 14 }} xl={{ span: 16 }}>
          <Title level={4}>Overview</Title>
          <Paragraph>
            This tab contains general information about your mine and important contacts at EMPR.
          </Paragraph>
          <Alert
            message="Information on this tab is pulled from current Ministry resources. If anything is
            incorrect, please notify one of the Ministry contacts shown."
            type="info"
            banner
          />
          <br />
          <Descriptions column={1} colon={false}>
            <Descriptions.Item label="Region">{this.props.mine.mine_region}</Descriptions.Item>
            <Descriptions.Item label="Coordinate">
              {`${(this.props.mine.mine_location && this.props.mine.mine_location.latitude) ||
                Strings.NOT_APPLICABLE},${(this.props.mine.mine_location &&
                this.props.mine.mine_location.longitude) ||
                Strings.NOT_APPLICABLE}`}
            </Descriptions.Item>
            <Descriptions.Item label="Commodity">{Strings.NOT_APPLICABLE}</Descriptions.Item>
            <Descriptions.Item label="Operating Status">{Strings.NOT_APPLICABLE}</Descriptions.Item>
            <Descriptions.Item label="Disturbance">{Strings.NOT_APPLICABLE}</Descriptions.Item>
          </Descriptions>
          <Row>
            <Col xl={{ span: 11 }} xxl={{ span: 10 }}>
              <ContactCard
                title="Mine Manager"
                party={partyMineManager}
                dateLabel="Mine Manager Since"
              />
            </Col>
            <Col xl={{ span: 11, offset: 2 }} xxl={{ span: 10, offset: 2 }}>
              <ContactCard title="Permittee" party={partyPermittee} dateLabel="Permittee Since" />
            </Col>
          </Row>
        </Col>
        <Col lg={{ span: 9, offset: 1 }} xl={{ offset: 1, span: 7 }}>
          <Card title="Ministry Contacts">
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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

Overview.propTypes = propTypes;
Overview.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
