// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import { Row, Col, Card, Descriptions, Typography } from "antd";
import ContactCard from "@/components/common/ContactCard";
import * as Strings from "@/constants/strings";
import * as Contacts from "@/constants/ministryContacts";

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
  render() {
    return (
      <Row>
        <Col lg={{ span: 14 }} xl={{ span: 16 }}>
          <Title level={4}>Overview</Title>
          <Paragraph>
            This tab contains general information about your mine and important contacts at EMPR.
          </Paragraph>
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
              <Text strong style={{ textTransform: "uppercase" }}>
                Regional Health and Safety
              </Text>
              <br />
              <Text>{Contacts.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.NAME}</Text>
              <br />
              <Text>{Contacts.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.PHONE}</Text>
              <br />
              <Text>
                <a href={`mailto:${Contacts.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.EMAIL}`}>
                  {Contacts.MINISTRY_CONTACTS.REGIONAL_HEALTH_AND_SAFETY.EMAIL}
                </a>
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong style={{ textTransform: "uppercase" }}>
                Regional Mine General
              </Text>
              <br />
              <Text>
                <a href={`mailto:${Contacts.MINISTRY_CONTACTS.REGIONAL_MINE_GENERAL.EMAIL}`}>
                  {Contacts.MINISTRY_CONTACTS.REGIONAL_MINE_GENERAL.EMAIL}
                </a>
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong style={{ textTransform: "uppercase" }}>
                Major Mine General
              </Text>
              <br />
              <Text>
                <a href={`mailto:${Contacts.MINISTRY_CONTACTS.MAJOR_MINE_GENERAL.EMAIL}`}>
                  {Contacts.MINISTRY_CONTACTS.MAJOR_MINE_GENERAL.EMAIL}
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
