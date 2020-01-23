/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import { Row, Col, Card, Descriptions, Typography, Icon } from "antd";
import * as Strings from "@/constants/strings";

const { Paragraph, Text, Title } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {};

const ContactCardRow = (props) => (
  <Row>
    <Col span={4}>
      <Icon type={props.icon} style={{ fontSize: "2em" }} />
    </Col>
    <Col span={20}>
      <Text strong style={{ textTransform: "capitalize" }}>
        {props.label}
      </Text>
      <br />
      <Text>{props.value}</Text>
    </Col>
  </Row>
);

const ContactCard = (props) => (
  <Card title={props.title}>
    <ContactCardRow icon="user" label="Name" value={props.party.name} />
    <br />
    <ContactCardRow icon="mail" label="Email" value={props.party.email} />
    <br />
    <ContactCardRow icon="phone" label="Phone" value={props.party.phone} />
    <br />
    <ContactCardRow icon="calendar" label={props.dateLabel} value={props.party.date} />
  </Card>
);

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
  render() {
    console.log(this.props);
    return (
      <div>
        <Row>
          <Col lg={{ span: 16 }}>
            <Title level={4}>Description</Title>
            <Paragraph>{this.props.mine.mine_note || Strings.NOT_APPLICABLE}</Paragraph>

            <Title level={4}>Details</Title>
            <Descriptions column={1} colon={false}>
              <Descriptions.Item label="Coordinate">
                {`${this.props.mine.mine_location.latitude || Strings.NOT_APPLICABLE},${this.props
                  .mine.mine_location.longitude || Strings.NOT_APPLICABLE}`}
              </Descriptions.Item>
              <Descriptions.Item label="Commodity">{Strings.NOT_APPLICABLE}</Descriptions.Item>
              <Descriptions.Item label="Operating Status">
                {Strings.NOT_APPLICABLE}
              </Descriptions.Item>
              <Descriptions.Item label="Disturbance">{Strings.NOT_APPLICABLE}</Descriptions.Item>
            </Descriptions>

            <Title level={4}>Contacts</Title>
            <Row>
              <Col xl={{ span: 10 }}>
                <ContactCard
                  title="Mine Manager"
                  party={partyMineManager}
                  dateLabel="Mine Manager Since"
                />
              </Col>
              <Col xl={{ offset: 2, span: 10 }}>
                <ContactCard title="Permittee" party={partyPermittee} dateLabel="Permittee Since" />
              </Col>
            </Row>
          </Col>
          <Col lg={{ offset: 1, span: 7 }}>
            <Card title="Ministry Contacts">
              <Paragraph>
                <Text strong>Regional Health and Safety:</Text>
                <br />
                <Text>{Strings.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.NAME}</Text>
                <br />
                <Text>{Strings.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.PHONE}</Text>
                <br />
                <Text>
                  <a href={`mailto:${Strings.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.EMAIL}`}>
                    {Strings.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.EMAIL}
                  </a>
                </Text>
              </Paragraph>
              <Paragraph>
                <Text strong>Regional Mine General:</Text>
                <br />
                <Text>
                  <a href={`mailto:${Strings.MINISTRY_CONTACTS.REGIONAL_MINE_GENERAL.EMAIL}`}>
                    {Strings.MINISTRY_CONTACTS.REGIONAL_MINE_GENERAL.EMAIL}
                  </a>
                </Text>
              </Paragraph>
              <Paragraph>
                <Text strong>Major Mine General:</Text>
                <br />
                <Text>
                  <a href={`mailto:${Strings.MINISTRY_CONTACTS.MAJOR_MINE_GENERAL.EMAIL}`}>
                    {Strings.MINISTRY_CONTACTS.MAJOR_MINE_GENERAL.EMAIL}
                  </a>
                </Text>
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

Overview.propTypes = propTypes;
Overview.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
