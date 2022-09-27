import PropTypes from "prop-types";
import React from "react";
import { Icon as LegacyIcon } from "@ant-design/compatible";
import { Row, Col, Card, Typography } from "antd";
import { formatDate } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";

const ContactCardRow = (data) => (
  <Row className="contact-card-row">
    <Col span={24}>
      <LegacyIcon type={data.icon} className="contact-card-row-icon" />
      <Typography.Paragraph className="contact-card-row-field">
        <Typography.Text strong className="contact-card-row-field-title">
          {data.label}
        </Typography.Text>
        <Typography.Text>{data.value}</Typography.Text>
      </Typography.Paragraph>
    </Col>
  </Row>
);

const propTypes = {
  title: PropTypes.string.isRequired,
  dateLabel: PropTypes.string.isRequired,
  partyRelationship: CustomPropTypes.partyRelationship,
};

const defaultProps = {
  partyRelationship: {},
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
        props.partyRelationship ? formatDate(props.partyRelationship.start_date) : Strings.UNKNOWN
      }
    />
  </Card>
);

ContactCard.propTypes = propTypes;
ContactCard.defaultProps = defaultProps;

export default ContactCard;
