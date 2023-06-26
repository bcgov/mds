import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Row, Col, Typography } from "antd";
import { getPartyRelationshipTypeHash } from "@common/selectors/staticContentSelectors";
import { party } from "@/customPropTypes/parties";

const fieldPropTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  span: PropTypes.number,
};

const fieldDefaultProps = {
  span: 12,
};

const getContactAddress = (contact) => {
  if (!contact.address || !contact.address[0]) {
    return "N/A";
  }
  const address = contact.address[0];
  const suiteNo = address.suite_no ? `${address.suite_no}-` : "";
  const addressLine1 = address.address_line_1 ? `${address.address_line_1}, ` : "";
  const addressLine2 = address.address_line_2 ? `${address.address_line_2}, ` : "";
  const city = address.city ? `${address.city}, ` : "";
  const postCode = address.post_code ? address.post_code : "";

  return `${suiteNo}${addressLine1}${addressLine2}${city}${postCode}`;
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
  relationshipTypeHash: PropTypes.objectOf(PropTypes.strings).isRequired,
};

export const ContactDetails = (props) => (
  <Row>
    <ContactField label="First Name" value={props.contact.first_name} />
    <ContactField label="Last Name" value={props.contact.party_name} />
    <ContactField
      label="Job Title"
      value={
        props.contact.job_title_code
          ? props.relationshipTypeHash[props.contact.job_title_code]
          : "N/A"
      }
    />
    <ContactField
      label="Company Affiliation"
      value={props.contact.organization?.party_name || "N/A"}
    />
    <ContactField label="Email" value={props.contact.email} />
    <ContactField span={8} label="Phone Number" value={props.contact.phone_no} />
    <ContactField span={4} label="Ext." value={props.contact.phone_ext || "N/A"} />
    <ContactField label="Address (Optional)" value={getContactAddress(props.contact)} />
  </Row>
);

ContactDetails.propTypes = contactPropTypes;
ContactField.propTypes = fieldPropTypes;
ContactField.defaultProps = fieldDefaultProps;

const mapStateToProps = (state) => ({
  relationshipTypeHash: getPartyRelationshipTypeHash(state),
});

export default connect(mapStateToProps)(ContactDetails);
