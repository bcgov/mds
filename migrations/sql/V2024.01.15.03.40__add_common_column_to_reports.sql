ALTER TABLE mine_report_definition
ADD COLUMN is_common BOOLEAN DEFAULT FALSE;

UPDATE mine_report_definition
SET is_common = TRUE
WHERE report_name IN (
  'Annual Reclamation Report',
  'Annual Summary of Exploration Activities',
  'Annual Summary of Placer Activities',
  'Annual Summary of Work and Reclamation Report',
  'Annual Dam Safety Inspection (DSI)',
  'ITRB Activities Report',
  'Mine Emergency Response Plan',
  'Multi-Year Area Based Permit Updates',
  'Notification To Start',
  'Notification To Stop'
);