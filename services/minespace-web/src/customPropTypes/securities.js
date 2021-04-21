import { PropTypes } from "prop-types";

export const payer = PropTypes.shape({
  party_name: PropTypes.string,
  name: PropTypes.string,
  first_name: PropTypes.string,
});

export const bond = PropTypes.shape({
  bond_id: PropTypes.number,
  bond_guid: PropTypes.string,
  amount: PropTypes.number,
  bond_type_code: PropTypes.string,
  payer_party_guid: PropTypes.string,
  bond_status_code: PropTypes.string,
  reference_number: PropTypes.string,
  issue_date: PropTypes.string,
  payer,
  permit_guid: PropTypes.string,
  permit_no: PropTypes.string,
});
