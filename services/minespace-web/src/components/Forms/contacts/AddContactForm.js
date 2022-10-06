import React, { useState } from "react";
import { connect } from "react-redux";
import { uniqBy } from "lodash";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import PropTypes from "prop-types";
import AddContactFormDetails from "./AddContactFormDetails";

import { partyRelationship as PartyRelationShipType } from "@/customPropTypes/parties";

const propTypes = {
  parties: PropTypes.arrayOf(PartyRelationShipType).isRequired,
  mine_party_appt_type_code: PropTypes.string.isRequired,
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

  const contacts = uniqBy(props.parties || [], (partyAppt) => partyAppt.party.party_guid)
    .filter(
      ({ mine_party_appt_type_code }) =>
        !props.mine_party_appt_type_code ||
        mine_party_appt_type_code === props.mine_party_appt_type_code
    )
    .map(({ party: { name, party_guid } }) => ({
      label: name,
      value: party_guid,
    }));

  return (
    <AddContactFormDetails
      contacts={contacts}
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
  parties: getPartyRelationships(state),
});

export default connect(mapStateToProps)(AddContactForm);
