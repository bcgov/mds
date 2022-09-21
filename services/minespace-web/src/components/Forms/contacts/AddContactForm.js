import React, { useState } from "react";
import { connect } from "react-redux";
import {
  getEngineersOfRecordOptions,
  getPartyRelationships,
} from "@common/selectors/partiesSelectors";
import PropTypes from "prop-types";
import AddContactFormDetails from "./AddContactFormDetails";

import {
  party as partyType,
  partyRelationship as PartyRelationShipType,
} from "@/customPropTypes/parties";

const propTypes = {
  contacts: PropTypes.arrayOf(partyType).isRequired,
  parties: PropTypes.arrayOf(PartyRelationShipType).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const defaultProps = {};

export const AddContactForm = (props) => {
  const [selectedParty, setSelectedParty] = useState(null);

  const handleSelectChange = (evt, val) => {
    if (!val) {
      setSelectedParty(null);
    } else {
      const partyRelationship = props.parties.find((p) => p.party.party_guid === val);

      if (partyRelationship) {
        setSelectedParty(partyRelationship.party);
      }
    }
  };

  return (
    <AddContactFormDetails
      contacts={props.contacts}
      parties={props.parties}
      initialValues={selectedParty}
      handleSelectChange={handleSelectChange}
      onCancel={props.onCancel}
      onSubmit={props.onSubmit}
    />
  );
};

AddContactForm.propTypes = propTypes;
AddContactForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  contacts: getEngineersOfRecordOptions(state),
  parties: getPartyRelationships(state),
});

export default connect(mapStateToProps)(AddContactForm);
