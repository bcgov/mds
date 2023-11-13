import React from "react";
import { PropTypes } from "prop-types";
import { Row, Col, Card } from "antd";
import { Link } from "react-router-dom";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import Address from "@/components/common/Address";
import EditNoWContacts from "@/components/Forms/noticeOfWork/EditNoWContacts";

const propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party })))
    .isRequired,
  contactFormValues: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party }))
  ).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  isViewMode: PropTypes.bool.isRequired,
};

const NOWContact = (contact) => (
  <Col key={contact.now_party_appointment_id} sm={24} lg={12} xxl={8}>
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
        <h4>
          <Link
            style={{ fontSize: "1.5rem", fontWeight: "bold" }}
            to={router.PARTY_PROFILE.dynamicRoute(contact.party.party_guid)}
          >
            {contact.party.name}
          </Link>
        </h4>
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
    {props.isViewMode ? (
      <>
        {props.contacts && props.contacts.length >= 1 ? (
          <Row gutter={16}>{props.contacts.map((contact) => NOWContact(contact))}</Row>
        ) : (
          <NullScreen type="now-contacts" />
        )}
      </>
    ) : (
      <EditNoWContacts
        initialValues={props.noticeOfWork}
        isEditView
        contactFormValues={props.contactFormValues}
      />
    )}
  </div>
);

ReviewNOWContacts.propTypes = propTypes;

export default ReviewNOWContacts;
