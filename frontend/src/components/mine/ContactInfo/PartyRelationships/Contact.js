import React, { Component } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { EngineerOfRecord } from "@/components/mine/ContactInfo/PartyRelationships/EngineerOfRecord";
import { Permittee } from "@/components/mine/ContactInfo/PartyRelationships/Permittee";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func,
  mine: PropTypes.object.isRequired,
  openEditPartyRelationshipModal: PropTypes.func,
  onSubmitEditPartyRelationship: PropTypes.func,
  removePartyRelationship: PropTypes.func,
  otherDetails: PropTypes.object,
  isEditable: PropTypes.bool,
};

const doNothing = () => {};

const defaultProps = {
  handleChange: () => {
    doNothing();
  },
  openEditPartyRelationshipModal: () => {
    doNothing();
  },
  onSubmitEditPartyRelationship: () => {
    doNothing();
  },
  removePartyRelationship: () => {
    doNothing();
  },
  otherDetails: {},
  isEditable: false,
};

export class Contact extends Component {
  componentWillMount() {}

  render() {
    let component;

    switch (this.props.partyRelationship.mine_party_appt_type_code) {
      case "EOR":
        component = (
          <EngineerOfRecord
            partyRelationship={this.props.partyRelationship}
            partyRelationshipTypeLabel={this.props.partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.props.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.props.onSubmitEditPartyRelationship}
            removePartyRelationship={this.props.removePartyRelationship}
            isEditable={this.props.isEditable}
          />
        );
        break;
      case "PMT":
        component = (
          <Permittee
            partyRelationship={this.props.partyRelationship}
            partyRelationshipTypeLabel={this.props.partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.props.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.props.onSubmitEditPartyRelationship}
            removePartyRelationship={this.props.removePartyRelationship}
            isEditable={this.props.isEditable}
          />
        );
        break;
      default:
        component = (
          <DefaultContact
            partyRelationship={this.props.partyRelationship}
            partyRelationshipTypeLabel={this.props.partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.props.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.props.onSubmitEditPartyRelationship}
            removePartyRelationship={this.props.removePartyRelationship}
            isEditable={this.props.isEditable}
          />
        );
        break;
    }
    return component;
  }
}

Contact.propTypes = propTypes;
Contact.defaultProps = defaultProps;

export default Contact;
