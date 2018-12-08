import React, { Component } from "react";
import PropTypes from "prop-types";
import * as CustomPropTypes from "@/types";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
};

export class EngineerOfRecord extends Component {
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

    const eorPartyRelationshipTypeLabel =
      partyRelationshipTypeLabel +
      " - " +
      mine.mine_tailings_storage_facility.find(
        (x) =>
          x.mine_tailings_storage_facility_guid ===
          partyRelationship.mine_tailings_storage_facility_guid
      ).mine_tailings_storage_facility_name;

    return (
      <DefaultContact
        partyRelationship={partyRelationship}
        partyRelationshipTypeLabel={eorPartyRelationshipTypeLabel}
        handleChange={handleChange}
        mine={mine}
        openEditPartyRelationshipModal={openEditPartyRelationshipModal}
        onSubmitEditPartyRelationship={onSubmitEditPartyRelationship}
        removePartyRelationship={removePartyRelationship}
      />
    );
  }
}

EngineerOfRecord.propTypes = propTypes;

export default EngineerOfRecord;
