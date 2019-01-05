import React, { Component } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { EngineerOfRecord } from "@/components/mine/ContactInfo/PartyRelationships/EngineerOfRecord";
import { Permittee } from "@/components/mine/ContactInfo/PartyRelationships/Permittee";

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

export class Contact extends Component {
  constructor(props) {
    super(props);
    this.TSFConfirmation = React.createRef();
  }

  componentWillMount() {}

  render() {
    let component;

    switch (partyRelationship.mine_party_appt_type_code) {
      case "EOR":
        component = (
          <EngineerOfRecord
            partyRelationship={partyRelationship}
            partyRelationshipTypeLabel={partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.onSubmitEditPartyRelationship}
            removePartyRelationship={this.removePartyRelationship}
          />
        );
        break;
      case "PMT":
        component = (
          <Permittee
            partyRelationship={partyRelationship}
            partyRelationshipTypeLabel={partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.onSubmitEditPartyRelationship}
            removePartyRelationship={this.removePartyRelationship}
          />
        );
        break;
      default:
        component = (
          <DefaultContact
            partyRelationship={partyRelationship}
            partyRelationshipTypeLabel={partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.onSubmitEditPartyRelationship}
            removePartyRelationship={this.removePartyRelationship}
          />
        );
        break;
    }
    return component;
  }
}
