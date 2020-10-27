CREATE OR REPLACE FUNCTION mms_etl_bond_data() RETURNS void AS $$
BEGIN
declare

		tmp_num_records integer;
        tmp1 integer;
        tmp2 integer;
        tmp3 integer;
  begin
	CREATE TABLE IF NOT EXISTS ETL_RECLAMATION_INVOICES(
		core_reclamation_invoice_id integer,
		permit_id integer,
		sec_cid varchar,
		inv_cid varchar UNIQUE,
		paid_dt TIMESTAMP,
		contractor_nm varchar,
		amount numeric(12,2) NOT NULL,
		descript varchar
	);

	INSERT INTO ETL_RECLAMATION_INVOICES(
		permit_id,
		inv_cid,
		paid_dt,
		contractor_nm,
		amount,
		descript
	)
	SELECT DISTINCT ON inv.inv_cid
		bpx.permit_id,
		inv.inv_cid,
		inv.paid_dt,
		inv.contractor_nm,
		inv.amount,
		inv.descript
	FROM mms.secinv inv
	inner join bond b on b.sec_cid = inv.sec_cid
	inner join bond_permit_xref bpx on bpx.bond_id = b.bond_id;


	INSERT INTO reclamation_invoices (
		mms_inv_cid,
		permit_id,
		amount,
		vendor,
		paid_date
		note
		create_user,
		update_user,
		)
	select
		DISTINCT ON (permit_id, paid_amt, contractor_nm)
		bpx.permit_id,
		inv.paid_amt,
		inv.contractor_nm,
		inv.paid_dt,
		inv.descript,
		'bond_etl',
		'bond_etl',
	from ETL_RECLAMATION_INVOICES e_inv
	where
		e_inv.paid_amt != 0
		AND
		e_inv.core_reclamation_invoice_id is not null

END;
END;
$$ LANGUAGE PLPGSQL;