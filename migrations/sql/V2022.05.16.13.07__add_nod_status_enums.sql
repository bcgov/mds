ALTER TYPE nod_status ADD VALUE 'in-review' AFTER 'pending_review';
ALTER TYPE nod_status ADD VALUE 'ministry_authorized' AFTER 'self_authorized';
ALTER TYPE nod_status ADD VALUE 'permit_amendment_required';
ALTER TYPE nod_status ADD VALUE 'additional_information_required';
ALTER TYPE nod_status ADD VALUE 'not_authorized';
ALTER TYPE nod_status ADD VALUE 'withdrawn';