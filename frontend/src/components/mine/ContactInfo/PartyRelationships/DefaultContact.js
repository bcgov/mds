import React, { Component } from "react";
import PropTypes from "prop-types";
import * as CustomPropTypes from "@/customPropTypes";
import { Button, Icon, Popconfirm } from "antd";
import { GREEN_PENCIL } from "@/constants/assets";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
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
    return (
      <div>
        <div className="inline-flex between">
          <div>
            <h4>{this.props.partyRelationshipTypeLabel}</h4>
            <Icon type="clock-circle" />
            &nbsp;&nbsp;
            {this.props.partyRelationship.start_date === "None"
              ? "Unknown"
              : this.props.partyRelationship.start_date}{" "}
            -{" "}
            {this.props.partyRelationship.end_date === "None"
              ? "Present"
              : this.props.partyRelationship.end_date}
            <br />
            <br />
          </div>
          <div>
            <Button
              key={`${this.props.partyRelationship.mine_party_appt_guid  }_edit`}
              ghost
              type="primary"
              onClick={(event) =>
                this.props.openEditPartyRelationshipModal(
                  this.props.partyRelationship,
                  this.props.onSubmitEditPartyRelationship,
                  this.props.handleChange,
                  this.props.mine
                )
              }
            >
              <img style={{ padding: "5px" }} src={GREEN_PENCIL} />
            </Button>
            <Popconfirm
              key={`${this.props.partyRelationship.mine_party_appt_guid  }_delete`}
              placement="topLeft"
              title={`Are you sure you want to delete this ${
                this.props.partyRelationshipTypeLabel
              }?`}
              onConfirm={(event) =>
                this.props.removePartyRelationship(
                  event,
                  this.props.partyRelationship.mine_party_appt_guid
                )
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
        <h5 className="bold">{this.props.partyRelationship.party.name}</h5>
        <Icon type="mail" />
        &nbsp;&nbsp;
        {this.props.partyRelationship.party.email}&nbsp;&nbsp;&nbsp;&nbsp;
        <br />
        <Icon type="phone" />
        &nbsp;&nbsp;
        {this.props.partyRelationship.party.phone_no}{" "}
        {this.props.partyRelationship.party.phone_ext
          ? `x${  this.props.partyRelationship.party.phone_ext}`
          : ""}
      </div>
    );
  }
}

DefaultContact.propTypes = propTypes;

export default DefaultContact;
