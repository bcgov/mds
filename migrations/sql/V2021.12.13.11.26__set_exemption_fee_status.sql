-- All closed permits are exempt, drafts will be updated once issued.
update permit
set exemption_fee_status_code = 'Y'
where permit.permit_status_code in ('C', 'D') and exemption_fee_status_code is null;

-- All Placer permits are exempt.
--  create Placer mine_type
INSERT INTO mine_type(mine_guid, mine_tenure_type_code, create_user, update_user, active_ind, permit_guid) SELECT placer_mine_type_insert.mine_guid, 'PLR', 'system-mds', 'system-mds', true, placer_mine_type_insert.permit_guid 
FROM (Select p.permit_guid as permit_guid, p.permit_id, mpx.mine_guid as mine_guid from permit p 
left join mine_type mt on mt.permit_guid = p.permit_guid 
join mine_permit_xref mpx on p.permit_id = mpx.permit_id
where permit_no like 'P-%' and exemption_fee_status_code is null) as placer_mine_type_insert;
-- update exemption_fee_status
update permit set exemption_fee_status_code = 'Y' where permit_no like 'P-%' and exemption_fee_status_code is null;


-- All Quary and S&G permits are 'MIP'.
-- Do not create mine_types as these permits can have multiple tenure options which cannot be easily determined.
update permit set exemption_fee_status_code = 'MIP' where permit_no like 'G-%' and exemption_fee_status_code is null;
update permit set exemption_fee_status_code = 'MIP' where permit_no like 'Q-%' and exemption_fee_status_code is null;

-- All Mineral and Coal are 'MIM'. 
-- create Coal mine_type
INSERT INTO mine_type(mine_guid, mine_tenure_type_code, create_user, update_user, active_ind, permit_guid) SELECT coal_mine_type_insert.mine_guid, 'COL', 'system-mds', 'system-mds', true, coal_mine_type_insert.permit_guid 
FROM (Select p.permit_guid as permit_guid, p.permit_id, mpx.mine_guid as mine_guid from permit p 
left join mine_type mt on mt.permit_guid = p.permit_guid 
join mine_permit_xref mpx on p.permit_id = mpx.permit_id
where permit_no like 'C-%' and exemption_fee_status_code is null) as coal_mine_type_insert;
-- update coal exemption_fee_status_code
update permit set exemption_fee_status_code = 'MIM' where permit_no like 'C-%' and exemption_fee_status_code is null;

-- create Mineral mine_type
INSERT INTO mine_type(mine_guid, mine_tenure_type_code, create_user, update_user, active_ind, permit_guid) SELECT mineral_mine_type_insert.mine_guid, 'MIN', 'system-mds', 'system-mds', true, mineral_mine_type_insert.permit_guid 
FROM (Select p.permit_guid as permit_guid, p.permit_id, mpx.mine_guid as mine_guid from permit p 
left join mine_type mt on mt.permit_guid = p.permit_guid 
join mine_permit_xref mpx on p.permit_id = mpx.permit_id
where permit_no like 'M-%' and exemption_fee_status_code is null) as mineral_mine_type_insert;
-- update 
update permit set exemption_fee_status_code = 'MIM' where permit_no like 'M-%' and exemption_fee_status_code is null;


-- create Mineral mine_type with disturnace for exploration permits
DO $$DECLARE r record;
BEGIN

 FOR r IN INSERT INTO mine_type(mine_guid, mine_tenure_type_code, create_user, update_user, active_ind, permit_guid) 
SELECT coal_exploration_mine_type_insert.mine_guid, 'MIN', 'system-mds', 'system-mds', true, coal_exploration_mine_type_insert.permit_guid 
FROM (Select p.permit_guid as permit_guid, p.permit_id, mpx.mine_guid as mine_guid from permit p 
left join mine_type mt on mt.permit_guid = p.permit_guid 
join mine_permit_xref mpx on p.permit_id = mpx.permit_id
where permit_no like 'MX-%' and exemption_fee_status_code is null) as coal_exploration_mine_type_insert returning *
    LOOP
        INSERT INTO mine_type_detail_xref(mine_disturbance_code, mine_type_guid, create_user, update_user, active_ind) values ('SUR', r.mine_type_guid, 'system-mds', 'system-mds', true); 
    END LOOP;

end
$$LANGUAGE plpgsql;


-- create Coal mine_type with disturnace for exploration permits
DO $$DECLARE r record;
BEGIN

 FOR r IN INSERT INTO mine_type(mine_guid, mine_tenure_type_code, create_user, update_user, active_ind, permit_guid) 
SELECT coal_exploration_mine_type_insert.mine_guid, 'COL', 'system-mds', 'system-mds', true, coal_exploration_mine_type_insert.permit_guid 
FROM (Select p.permit_guid as permit_guid, p.permit_id, mpx.mine_guid as mine_guid from permit p 
left join mine_type mt on mt.permit_guid = p.permit_guid 
join mine_permit_xref mpx on p.permit_id = mpx.permit_id
where permit_no like 'CX-%' and exemption_fee_status_code is null) as coal_exploration_mine_type_insert returning *
    LOOP
        INSERT INTO mine_type_detail_xref(mine_disturbance_code, mine_type_guid, create_user, update_user, active_ind) values ('SUR', r.mine_type_guid, 'system-mds', 'system-mds', true); 
    END LOOP;

end
$$LANGUAGE plpgsql;

-- update the exemption fee status for exploration permits
-- Exploration with ONLY surface, are exempt.
update permit set exemption_fee_status_code = 'Y' where permit_no like 'X-%' and exemption_fee_status_code is null;