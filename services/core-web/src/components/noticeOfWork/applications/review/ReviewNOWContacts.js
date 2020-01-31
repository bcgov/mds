import React from "react";
import { PropTypes } from "prop-types";
import { Row, Col, Card } from "antd";
import { formatTitleString } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import Address from "@/components/common/Address";

const propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party })))
    .isRequired,
};

const NOWContact = (contact) => (
  <Col key={contact.now_party_appointment_id} xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
    {" "}
    <Card
      title={
        <div className="inline-flex between wrap">
          <div>
            <h3>{contact.mine_party_appt_type_code_description}</h3>
          </div>
        </div>
      }
      bordered={false}
    >
      <div>
        <h4>{formatTitleString(contact.party.name)}</h4>
        <br />
        <h6>Email Address</h6>
        {contact.party.email ? (
          <a href={`mailto:${contact.party.email}`}>{contact.party.email}</a>
        ) : (
          <span>{Strings.EMPTY_FIELD}</span>
        )}
        <br />
        <br />
        <h6>Phone Number</h6>
        {contact.party.phone_no} {contact.party.phone_ext ? `x${contact.party.phone_ext}` : ""}
        <br />
        <br />
        <h6>Mailing Address</h6>
        <Address address={contact.party.address.length > 0 && contact.party.address[0]} />
      </div>
    </Card>
  </Col>
);

export const ReviewNOWContacts = (props) => (
  <div>
    {props.contacts && props.contacts.length >= 1 ? (
      <Row gutter={16}>{props.contacts.map((contact) => NOWContact(contact))}</Row>
    ) : (
      <NullScreen type="now-contacts" />
    )}
  </div>
);

ReviewNOWContacts.propTypes = propTypes;

export default ReviewNOWContacts;
