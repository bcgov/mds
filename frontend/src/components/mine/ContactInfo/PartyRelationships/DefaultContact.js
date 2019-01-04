import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Button, Icon, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";
import { formatTitleString } from "@/utils/helpers";
import { BRAND_PENCIL } from "@/constants/assets";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
  otherDetails: PropTypes.object,
};

export const DefaultContact = (props) => (
  <div>
    <div className="inline-flex between">
      <div>
        <h3>{props.partyRelationshipTypeLabel}</h3>
        <p>
          <Icon type="clock-circle" />
          &nbsp;&nbsp;
          {props.partyRelationship.start_date === "None"
            ? "Unknown"
            : props.partyRelationship.start_date}{" "}
          -{" "}
          {props.partyRelationship.end_date === "None"
            ? "Present"
            : props.partyRelationship.end_date}
          <br />
          <Link
            to={router.RELATIONSHIP_PROFILE.dynamicRoute(
              props.mine.guid,
              props.partyRelationship.mine_party_appt_type_code
            )}
          >
            View History
          </Link>
        </p>
        <br />
      </div>
      <div>
        <Button
          key={`${props.partyRelationship.mine_party_appt_guid}_edit`}
          ghost
          type="primary"
          onClick={() =>
            props.openEditPartyRelationshipModal(
              props.partyRelationship,
              props.onSubmitEditPartyRelationship,
              props.handleChange,
              props.mine
            )
          }
        >
          <img style={{ padding: "5px" }} src={BRAND_PENCIL} />
        </Button>
        <Popconfirm
          key={`${props.partyRelationship.mine_party_appt_guid}_delete`}
          placement="topLeft"
          title={`Are you sure you want to delete this ${props.partyRelationshipTypeLabel}?`}
          onConfirm={(event) =>
            props.removePartyRelationship(event, props.partyRelationship.mine_party_appt_guid)
          }
          okText="Delete"
          cancelText="Cancel"
        >
          <Button ghost type="primary">
            <Icon type="minus-circle" theme="outlined" />
          </Button>
        </Popconfirm>
      </div>
    </div>
    <h5>{formatTitleString(props.partyRelationship.party.name)}</h5>
    <p>
      <Icon type="mail" />
      &nbsp;&nbsp;
      <a href={`mailto:${props.partyRelationship.party.email}`}>
        {props.partyRelationship.party.email}
      </a>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <br />
      <Icon type="phone" />
      &nbsp;&nbsp;
      {props.partyRelationship.party.phone_no}{" "}
      {props.partyRelationship.party.phone_ext ? `x${props.partyRelationship.party.phone_ext}` : ""}
      <br />
      <Link to={router.PARTY_PROFILE.dynamicRoute(props.partyRelationship.party.party_guid)}>
        View Profile
      </Link>
    </p>
    {props.otherDetails}
  </div>
);

DefaultContact.propTypes = propTypes;

export default DefaultContact;
