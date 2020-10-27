CREATE OR REPLACE FUNCTION mms_etl_reclamation_invoice_data() RETURNS void AS $$
BEGIN
declare

		tmp_num_records integer;
        tmp1 integer;
        tmp2 integer;
        tmp3 integer;
  begin
	INSERT INTO reclamation_invoices (
		mms_inv_cid,
		permit_id,
		amount,
		vendor,
		paid_date,
		note,
		create_user,
		update_user
		)
	select
		inv.inv_cid,
		bpx.permit_id,
		inv.paid_amt,
		inv.contractor_nm,
		inv.paid_dt,
		inv.descript,
		'bond_etl',
		'bond_etl'
	FROM mms.secinv inv
	inner join bond b on b.sec_cid = inv.sec_cid
	inner join bond_permit_xref bpx on bpx.bond_id = b.bond_id
	WHERE
		inv.paid_amt != 0
		AND
		inv.mms_inv_cid not in (select distinct mms_inv_cid from reclamation_invoices where mms_inv_cid is not null);

END;
END;
$$ LANGUAGE PLPGSQL;