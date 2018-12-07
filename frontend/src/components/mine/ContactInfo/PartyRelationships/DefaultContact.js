import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Popconfirm } from "antd";
import { GREEN_PENCIL } from "@/constants/assets";

const propTypes = {
  partyRelationship: PropTypes.object.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
};

export class DefaultContact extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      partyRelationship,
      partyRelationshipTypeLabel,
      mine,
      openEditPartyRelationshipModal,
      onSubmitEditPartyRelationship,
      handleChange,
      removePartyRelationship,
    } = this.props;
    return (
      <div key={partyRelationship.mine_party_appt_guid}>
        <div className="inline-flex between">
          <div>
            <h4>{partyRelationshipTypeLabel}</h4>
            <Icon type="clock-circle" />
            &nbsp;&nbsp;
            {partyRelationship.start_date === "None"
              ? "Unknown"
              : partyRelationship.start_date} -{" "}
            {partyRelationship.end_date === "None" ? "Present" : partyRelationship.end_date}
            <br />
            <br />
          </div>
          <div>
            <Button
              key={partyRelationship.mine_party_appt_guid + "_edit"}
              ghost
              type="primary"
              onClick={(event) =>
                openEditPartyRelationshipModal(
                  partyRelationship,
                  onSubmitEditPartyRelationship,
                  handleChange,
                  mine
                )
              }
            >
              <img style={{ padding: "5px" }} src={GREEN_PENCIL} />
            </Button>
            <Popconfirm
              key={partyRelationship.mine_party_appt_guid + "_delete"}
              placement="topLeft"
              title={`Are you sure you want to delete this ${partyRelationshipTypeLabel}?`}
              onConfirm={(event) =>
                removePartyRelationship(event, partyRelationship.mine_party_appt_guid)
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
        <h5 className="bold">{partyRelationship.party.name}</h5>
        <Icon type="mail" />
        &nbsp;&nbsp;
        {partyRelationship.party.email}&nbsp;&nbsp;&nbsp;&nbsp;
        <br />
        <Icon type="phone" />
        &nbsp;&nbsp;
        {partyRelationship.party.phone_no}{" "}
        {partyRelationship.party.phone_ext ? "x" + partyRelationship.party.phone_ext : ""}
      </div>
    );
  }
}

DefaultContact.propTypes = propTypes;

export default DefaultContact;
