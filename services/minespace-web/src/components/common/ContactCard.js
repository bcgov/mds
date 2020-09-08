import PropTypes from "prop-types";
import React from "react";
import { Row, Col, Card, Typography, Icon } from "antd";
import { formatDate } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";

const { Paragraph, Text } = Typography;

const ContactCardRow = (data) => (
  <Row className="contact-card-row">
    <Col>
      <Icon type={data.icon} className="contact-card-row-icon" />
      <Paragraph className="contact-card-row-field">
        <Text strong className="contact-card-row-field-title">
          {data.label}
        </Text>
        <Text>{data.value}</Text>
      </Paragraph>
    </Col>
  </Row>
);

const propTypes = {
  title: PropTypes.string.isRequired,
  dateLabel: PropTypes.string.isRequired,
  partyRelationship: CustomPropTypes.partyRelationship,
};

const defaultProps = {
  party: {},
};

export const ContactCard = (props) => (
  <Card title={props.title} className="contact-card">
    <ContactCardRow
      icon="user"
      label="Name"
      value={props.partyRelationship ? props.partyRelationship.party.name : Strings.UNKNOWN}
    />
    <ContactCardRow
      icon="mail"
      label="Email"
      value={
        (props.partyRelationship && (
          <a href={`mailto:${props.partyRelationship.party.email}`}>
            {props.partyRelationship.party.email}
          </a>
        )) ||
        Strings.UNKNOWN
      }
    />
    <ContactCardRow
      icon="phone"
      label="Phone"
      value={props.partyRelationship ? props.partyRelationship.party.phone_no : Strings.UNKNOWN}
    />
    <ContactCardRow
      icon="calendar"
      label={props.dateLabel}
      value={
        props.partyRelationship
          ? formatDate(props.partyRelationship.effective_date)
          : Strings.UNKNOWN
      }
    />
  </Card>
);

ContactCard.propTypes = propTypes;
ContactCard.defaultProps = defaultProps;

export default ContactCard;
