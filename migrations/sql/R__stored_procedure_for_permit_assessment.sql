CREATE OR REPLACE FUNCTION transfer_permit_assessments() RETURNS void AS $$
BEGIN
	DROP TABLE IF EXISTS etl_permit_assessment_info;
	CREATE TEMPORARY TABLE etl_permit_assessment_info AS
		select 
			p.permit_id as permit_id,
			(select pa.permit_amendment_id from permit_amendment pa where pa.permit_id = p.permit_id order by pa.authorization_end_date desc limit 1) as permit_amendment_id,
			sum(b.amount) as liability_adjustment
		from bond b
		join bond_permit_xref bpx on b.bond_id = bpx.bond_id
		join permit p on bpx.permit_id = p.permit_id
		where b.bond_status_code = 'ACT' or b.bond_status_code = 'CON'
		group by p.permit_id;

	UPDATE permit_amendment
	set liability_adjustment = 0,
		update_user = 'mms_migration',
		update_timestamp = now();

	UPDATE permit_amendment
		SET
			liability_adjustment = epai.liability_adjustment,
			update_user = 'mms_migration',
			update_timestamp = now()                     
		FROM etl_permit_assessment_info epai
		WHERE
			permit_amendment.permit_amendment_id = epai.permit_amendment_id;
END;
$$ LANGUAGE PLPGSQL;
