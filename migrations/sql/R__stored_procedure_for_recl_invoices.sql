CREATE OR REPLACE FUNCTION mms_etl_reclamation_invoice_data() RETURNS void AS $$
BEGIN
declare

		tmp_num_records integer;
        tmp1 integer;
        tmp2 integer;
        tmp3 integer;
  begin

	DELETE FROM reclamation_invoice where create_user = 'bond_etl';

INSERT INTO reclamation_invoice (
		permit_id,
		amount,
		vendor,
		paid_date,
		note,
		create_user,
		update_user
		)
	select
		bpx.permit_id,
		inv.paid_amt,
		inv.contractor_nm,
		inv.paid_dt,
		inv.descript,
		'bond_etl',
		'bond_etl'
	FROM mms.secinv inv
	inner join bond b on b.mms_sec_cid = inv.sec_cid
	inner join bond_permit_xref bpx on bpx.bond_id = b.bond_id
	WHERE
		inv.paid_amt != 0;

END;
END;
$$ LANGUAGE PLPGSQL;