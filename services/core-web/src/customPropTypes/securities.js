import { PropTypes } from "prop-types";
import { mineDocument } from "./documents";

export const payer = PropTypes.shape({
  party_name: PropTypes.string,
  name: PropTypes.string,
  first_name: PropTypes.string,
});

export const bond = PropTypes.shape({
  bond_id: PropTypes.number,
  bond_guid: PropTypes.string,
  amount: PropTypes.string,
  bond_type_code: PropTypes.string,
  payer_party_guid: PropTypes.string,
  bond_status_code: PropTypes.string,
  reference_number: PropTypes.string,
  issue_date: PropTypes.string,
  institution_name: PropTypes.string,
  institution_street: PropTypes.string,
  institution_city: PropTypes.string,
  institution_province: PropTypes.string,
  institution_postal_code: PropTypes.string,
  note: PropTypes.string,
  payer,
  permit_guid: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});

export const invoice = PropTypes.shape({
  reclamation_invoice_id: PropTypes.number,
  reclamation_invoice_guid: PropTypes.string,
  project_id: PropTypes.string,
  amount: PropTypes.string,
  vendor: PropTypes.string,
  permit_guid: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});
