

ALTER TABLE notice_of_departure ALTER nod_status TYPE text;
DROP TYPE nod_status;

-- In Review (EMLI has identified there is a NoD that requires review and they are now initiating it) - Not editable

-- Information Required (EMLI has identified that more information is required from the mine manager and wants to set their application back to an editable format so the mine manager can add further information through MineSpace) - Editable

-- Pending Review (mine manager has submitted a potentially substantial departure for EMLI engagement) - Editable

-- Withdrawn (EMLI has received notification from mine manager that they wish to withdraw their submission OR the mine manager goes into MineSpace and sets their own submission to withdrawn) - Not Editable

-- Self-determined - non-substantial (Mine manager has reviewed their activity(s) against the NoD self assessment form and activities are expected in the normal course of mining and contemplated under the existing permit) - Non-Editable

-- Determination - non-substantial (EMLI has reviewed the submission and deemed that the information contained in the submission adheres to existing permit conditions, Code and applicable legislation, authorizations, guidelines and industry standards) - Non-Editable

-- Determination - substantial (EMLI has reviewed the submission and deemed the departure to be substantial and cannot be managed under existing mine permit) - Non-Editable
CREATE TYPE nod_status AS ENUM (
  'pending_review', 
  'in_review', 
  'information_required',
  'self_determined_non_substantial', 
  'determined_non_substantial', 
  'determined_substantial',
  'withdrawn'
  );

UPDATE notice_of_departure SET nod_status = 'self_determined_non_substantial' WHERE nod_status = 'self_authorized';
UPDATE notice_of_departure SET nod_status = 'determined_non_substantial' WHERE nod_status = 'ministry_authorized';
UPDATE notice_of_departure SET nod_status = 'information_required' WHERE nod_status = 'additional_information_required';
UPDATE notice_of_departure SET nod_status = 'determined_substantial' WHERE nod_status = 'permit_amendment_required';

ALTER TABLE notice_of_departure ALTER nod_status TYPE nod_status USING nod_status::nod_status;
