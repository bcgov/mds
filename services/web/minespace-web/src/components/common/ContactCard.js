import PropTypes from "prop-types";
import React from "react";
import { Row, Col, Card, Icon, Typography } from "antd";

const { Text } = Typography;

const ContactCardRow = (data) => (
  <Row gutter={[32, 16]}>
    <Col span={3}>
      <Icon type={data.icon} style={{ fontSize: "2em" }} />
    </Col>
    <Col span={20} offset={1}>
      <Text strong style={{ textTransform: "uppercase" }}>
        {data.label}
      </Text>
      <br />
      <Text>{data.value}</Text>
    </Col>
  </Row>
);

const propTypes = {
  title: PropTypes.string.isRequired,
  dateLabel: PropTypes.string.isRequired,
  party: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const ContactCard = (props) => (
  <Card title={props.title}>
    <ContactCardRow icon="user" label="Name" value={props.party.name} />
    <br />
    <ContactCardRow
      icon="mail"
      label="Email"
      value={<a href={`mailto:${props.party.email}`}>{props.party.email}</a>}
    />
    <br />
    <ContactCardRow icon="phone" label="Phone" value={props.party.phone} />
    <br />
    <ContactCardRow icon="calendar" label={props.dateLabel} value={props.party.date} />
  </Card>
);

ContactCard.propTypes = propTypes;

export default ContactCard;
