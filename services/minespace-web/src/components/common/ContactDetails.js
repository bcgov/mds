import PropTypes from "prop-types";
import React from "react";
import { Row, Col, Typography } from "antd";
import { party } from "@/customPropTypes/parties";

const fieldPropTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  span: PropTypes.number,
};

const fieldDefaultProps = {
  span: 12,
};

const ContactField = ({ label, value, span = 12 }) => (
  <Col span={span}>
    <Typography.Paragraph>
      <Typography.Text strong>{label}</Typography.Text>
      <br />
      <Typography.Text>{value}</Typography.Text>
    </Typography.Paragraph>
  </Col>
);

const contactPropTypes = {
  contact: PropTypes.objectOf(party).isRequired,
};

export const ContactDetails = (props) => (
  <Row>
    <ContactField label="First Name" value={props.contact.first_name} />
    <ContactField label="Last Name" value={props.contact.party_name} />
    <ContactField label="Job Title" value={props.contact.job_title} />
    <ContactField label="Company name" value={props.contact.company_name} />
    <ContactField label="Email" value={props.contact.email} />
    <ContactField span={8} label="Phone Number" value={props.contact.phone_no} />
    <ContactField span={4} label="Ext." value={props.contact.phone_ext} />
  </Row>
);

ContactDetails.propTypes = contactPropTypes;
ContactField.propTypes = fieldPropTypes;
ContactField.defaultProps = fieldDefaultProps;

export default ContactDetails;
