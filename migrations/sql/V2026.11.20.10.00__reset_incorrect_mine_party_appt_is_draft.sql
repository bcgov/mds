-- MDS-6844: editing a contact in Core wrongly set is_draft = true (fixed in the API by the previous MDS-6844 PR)
-- Real drafts only exist for EOR/TQP contacts on draft TSFs, so those are left alone
UPDATE mine_party_appt
SET is_draft = false
WHERE is_draft = true
  AND mine_party_appt_type_code NOT IN ('EOR', 'TQP');
