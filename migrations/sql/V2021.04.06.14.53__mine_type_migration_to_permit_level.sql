DROP INDEX IF EXISTS mine_guid_mine_tenure_type_code_permit_guid_active_uniqeness;

CREATE OR REPLACE FUNCTION max (uuid, uuid)
RETURNS uuid AS $$
BEGIN
	IF $1 IS NULL OR $1 < $2 THEN
		RETURN $2;
	END IF;

	RETURN $1;
END;
$$ LANGUAGE plpgsql;


CREATE AGGREGATE max (uuid)
(
    sfunc = max,
    stype = uuid
);

DROP TABLE IF EXISTS multiple_permits;
CREATE TEMP TABLE multiple_permits AS 
	SELECT mine_guid, permit_guid FROM mine_permit_xref mpx JOIN permit p ON mpx.permit_id = p.permit_id WHERE mine_guid IN (
	SELECT mine_guid FROM mine_permit_xref mpx JOIN permit p ON mpx.permit_id = p.permit_id
	GROUP BY mine_guid 
	HAVING count(p.permit_id) > 1
);



-- PLACER
-- No related NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, p.permit_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and mt.mine_tenure_type_code = ('PLR');

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('PLR') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'PLR' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);



-- Matching NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'P'
and nai.now_application_id is not null
and (
na.notice_of_work_type_code = 'PLA' and mt.mine_tenure_type_code = ('PLR')
);

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('PLR') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'PLR' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);



-- COAL
-- No related NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'C'
and nai.now_application_id is null
and mt.mine_tenure_type_code = ('COL');

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('COL') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'COL' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);

-- Matching NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'C'
and nai.now_application_id is not null
and (
na.notice_of_work_type_code = 'COL' and mt.mine_tenure_type_code = ('COL')
);

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('COL') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'COL' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);



-- MINERAL
-- No related NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'M'
and nai.now_application_id is null
and mt.mine_tenure_type_code = ('MIN');

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('MIN') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'MIN' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);

-- Matching NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'M'
and nai.now_application_id is not null
and (
na.notice_of_work_type_code = 'MIN' and mt.mine_tenure_type_code = ('MIN')
);

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('MIN') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'MIN' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);



-- S&G
-- No related NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'G'
and nai.now_application_id is null
and mt.mine_tenure_type_code = ('BCL');

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('BCL') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'BCL' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);

-- Matching NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'G'
and nai.now_application_id is not null
and (
na.notice_of_work_type_code = 'SAG' and mt.mine_tenure_type_code = ('BCL')
);

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('BCL') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'BCL' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);



-- Quarry Construction Aggregate
-- No related NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'Q'
and nai.now_application_id is null
and mt.mine_tenure_type_code = ('BCL');

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('BCL') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'BCL' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);

-- Matching NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'Q'
and nai.now_application_id is not null
and (
(na.notice_of_work_type_code = 'QCA' or na.notice_of_work_type_code = 'SAG') and mt.mine_tenure_type_code = ('BCL') 
);

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('BCL') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'BCL' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);



-- Quarry Industrial Mineral
-- No related NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'Q'
and nai.now_application_id is null
and mt.mine_tenure_type_code = ('MIN');

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('MIN') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'MIN' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);

-- Matching NoW
DROP TABLE IF EXISTS mine_types;
CREATE TEMP TABLE mine_types AS 
SELECT m.mine_guid, mt.mine_tenure_type_code, nai.now_application_guid, na.notice_of_work_type_code, p.permit_guid, p.permit_no
from mine_type mt
join mine m on m.mine_guid = mt.mine_guid and mt.active_ind = true
left join mine_permit_xref mpx on mpx.mine_guid = m.mine_guid
left join permit p on p.permit_id = mpx.permit_id
left join lateral (select permit_amendment_guid, now_application_guid FROM permit_amendment WHERE permit_id = p.permit_id ORDER BY issue_date DESC NULLS LAST LIMIT 1) pa ON true
left join now_application_identity nai on pa.now_application_guid = nai.now_application_guid
left join now_application na on na.now_application_id = nai.now_application_id
where p.permit_status_code = 'O' 
and LEFT(p.permit_no, 1) = 'Q'
and nai.now_application_id is not null
and (
(na.notice_of_work_type_code = 'QIM' or na.notice_of_work_type_code = 'MIN') and mt.mine_tenure_type_code = ('MIN') 
);

UPDATE mine_type mt SET permit_guid = (SELECT max(permit_guid) FROM mine_types WHERE mine_guid=mt.mine_guid GROUP BY mine_guid )
WHERE mine_tenure_type_code = ('MIN') AND permit_guid IS NULL;

INSERT INTO mine_type (mine_guid, mine_tenure_type_code, create_user, update_user, permit_guid)
SELECT mine_guid, 'MIN' AS mine_tenure_type_code, 'system-mds' AS create_user, 'system-mds' AS update_user, permit_guid FROM mine_types 
WHERE permit_guid NOT IN (SELECT permit_guid FROM mine_type WHERE permit_guid IS NOT NULL);

CREATE UNIQUE INDEX mine_guid_mine_tenure_type_code_permit_guid_active_uniqeness ON mine_type USING btree (mine_guid, mine_tenure_type_code, permit_guid, active_ind) WHERE (active_ind = true);