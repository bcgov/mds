INSERT INTO party_type_code
    (
    party_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('PER', 'Person', 10, 'system-mds', 'system-mds'),
    ('ORG', 'Organization', 20, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Mike','Cloet','250-828-4428', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','RPF') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Justin','Schroff','250-847-7310', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','P.Geo') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3726 Alfred Ave','','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('John','Rus, P.Geo.','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','P.Geo') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Fl, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Megan','Frederick','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','3726 Alfred Avenue','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Timothy','Antill','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','M.Sc., P.Ag., R.P.Bio.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('350-1011 4th Ave','','Prince George','BC','V2L2H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Lyn','Konowalyk','778-696-2286', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Suite 202, 100 Cranbrook St. N.','','Cranbrook','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Ragan','Danford','250-565-7787', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('350 1011 4th Ave','','Prince George','BC','V2L3H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Gary','Van Spengen','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Investigation Lead','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('350 - 1011 4th Ave','','Prince George','BC','V2L2H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Lowell','Constable','250-952-0914', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Geotechnical','P.Eng') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor','1810 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Andrew','Sinstadt','250-387-0594', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Occupational Health','M.Sc.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor, 1810 Blanshard St','PO Box 9320 Stn Prov Govt','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Alexis','McPherson','250-360-7371', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Geotechnical','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('PO Box 9320 Stn Prov Govt','6th Fl, 1810 Blanshard St','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Paul','Beddoes','250-952-0832', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Environmental Geoscientist','M.Sc., R.P.Bio., P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor, 1810 Blanshard Street','','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Victoria','Stevens','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Reclamation','P.Ag., P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor','1810 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Andrew','Craig','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Environmental Geoscientist','B.Sc., G.I.T.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor','18101 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Tara','Cadeau','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Environmental Geoscientist','B.Sc., P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor','1810 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Barry','MacCallum','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','3793 Alfred Avenue','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Gareth','Scrivner','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior C&E Investigative Lead','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Fl., 441 Columbia St.','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Brendan','Scorrar','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','M.Sc., P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Fl, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Andrew','Dickinson','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','M.Sc.,RFP') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor','1810 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Nadia','Bruemmer','250-417-6037', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Blythe','Golobic','250-371-3915', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Health & Safety','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Jennifer','Brash','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Geotechnical','M.Eng., P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor','1810 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Brent','Beattie','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Geotechnical','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor','1810 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Adrian','Pooley','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('350-1011 4th Avenue','','Prince George','BC','V2L2H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Amy','Danko','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Ergonomics','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Fl, 1810 Blanshard Street','PO Box 9320 Stn Prov Govt','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Brian','Oke','250-565-4387', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','RPF') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Suite 350 - 1011 4th Avenue','','Prince George','BC','V2L3H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Rory','Cumming','250-828-4177', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Electrical','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('James','Robinson','250-847-7521', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','2nd Flr - 3726 Alfred Ave','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Alexandra','Glavina','250-847-7383', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','2nd Fl - 3726 Alfred Ave','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Robert','Abrams','250-614-9916', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Manager of Investigations','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('4051 18th Ave','','Prince George','BC','V2N1B3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Michael','Daigle','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Grant','Feldinger','250-394-4727', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Glen','Hendrickson','250-417-6033', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Andrea','Ross','250-847-7358', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','2nd Flr - 3726 Alfred Ave','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Marnie','Fraser','250-565-4387', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Suite 350-1011 4th Avenue','','Prince George','BC','V2L3H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Gerry','Barcelonia','250-952-0495', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Health & Safety','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor','1810 Blanshard Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Ann','Hart','778-696-2286', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Doug','Flynn','250-847-7386', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Health & Safety','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000 3726 Alfred Avenue','[NULL]','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Rick','Adams','250-828-4583', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines','RPF') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Kris','Bailey','250-565-4271', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Health & Safety','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('350-1011, 4th Avenue','','Prince George','BC','V2L3H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Adrienne','Turcotte, MLWS','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','A.Ag.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Fl, 441 Columbia Street','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Chris','LeClair','250-371-3714', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Health & Safety','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Fl, 441 Columbia St','','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Emmanuel R.','Padley','250-371-3991', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Electrical','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor, 441 Columbia Street','','Kamloops','BC','V2C4N7','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Lloyd','Bell','250-417-6014', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Jerry','Jewsbury','250-417-6007', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Health & Safety','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Diane','Howe','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Deputy Chief Inspector, Reclamation & Permitting','M.A.Sc., P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor, 1810 Blanshard Street','PO Box 9320 Stn Prov Govt','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Al','Hoffman','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Chief Inspector of Mines','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor, 1810 Blanshard Street','','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Bev','Quist','250-371-3786', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Mineral Titles Inspector/Mines Inspector','P.Geo, M.Sc.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor','441 Columbia Street','Kamloops','BC','V2C2T3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Sonia','Meili','250-847-7467', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Reclamation Specialist','P.Ag., P. Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','2nd Flr - 3726 Alfred Ave','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Liz','Murphy','250-847-7217', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Reclamation Specialist','P.Ag.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','2nd Flr - 3793 Alfred Ave','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Sarah','Henderson','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('1810 Blanshard St','','Victoria','BC','V8W9M9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('James','McMillan','250-952-0405', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Health & Safety','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor','1810 Blanshard Street','Victoria','BC','V8W9M9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Barry','Tracey','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St. South','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Bruce','Reid','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd Floor 42 8th Avenue South','','Cranbrook','BC','V1C2K3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Alan','Day','250-417-6013', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Health & Safety','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Jennifer','McConnachie','250-417-6035', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Reclamation','M.Sc., P.Ag.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Jim','Dunkley','250-953-4640', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('PO Box 9395, Stn Prov Gov''t','3rd Floor -1810 Blanshard Street','Victoria','BC','V8W9M9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Jorge','Freitas','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor, 1810 Blanshard Street','PO Box 9320 Stn Prov Govt','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Dave','Struthers','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Reclamation','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St South','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Michael','Cullen','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Geotechnical','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2282 Seabank Rd.','','Courtenay','BC','V9J1Y1','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Kim','Bellefontaine','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Manager, Environmental Geoscience & Permitting','M.Sc., P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('7th Floor,','1675 Douglas Street','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Cheryl','Pocklington','250-356-0974', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Ergonomist','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor, 1810 Blanshard Street','PO Box 9320, Stn Prov Govt','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Caroline','Nakatsuka','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Manager, Occupational Health','MSc, BMLSc, BEd') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('PO Box 9320 Stn Prov Govt','','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Terry','Paterson','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Electrical','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('2nd floor, 42 - 8th Ave. S.','','Cranbrook','BC','V1C2K3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Eamon','Mauer','250-847-7787', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Geotechnical','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','2nd Fl, 3726 Alfred Ave','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Todd','Wikjord','250-961-1948', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('350 - 1011 4th Ave','','Prince George','BC','V2L3H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Kathie','Wagar','250-417-6011', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Regional Director','P.Ag.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('202-100 Cranbrook St North','','Cranbrook','BC','V1C3P9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Heather','Cullen','250-565-4131', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Regional Director','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('350-1011 4th Ave','','Prince George','BC','V2L2H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Jessica','Norris','250-847-7452', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Bag 5000','2nd Flr - 3726 Alfred Ave','Smithers','BC','V0J2N0','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Bambi','Spyker','250-565-4206', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Suite 350 1011 4th Ave','','Prince George','BC','V2L3H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Laurie','Meade','250-565-4327', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Health & Safety','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Suite 350 1011 4th AVe','','Prince George','BC','V2L3H9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Andrew','Rollo','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Environmental Geoscientist','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('Suite 300 - 865 Horby Street','','Vancouver','BC','V6Z2G3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Michael','Olsen','250-387-4828', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor, 1810 Blanshard','','Victoria','BC','V8W9M9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Don J.','Harrison','250-953-3881', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor -1810 Blanshard St','','Victoria','BC','V8W9M9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Doran','Jones','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Emergency Preparedness Coordinator','') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor, 1810 Blanshard Street','PO Box 9320, Stn Prov Govt','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Brenda','Bailey','250-952-0934', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Environmental Geoscientist','Ph.D., P.Geo') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor - 1810 Blanshard Street','','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Victor','Marques','250-952-0493', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Geotechnical','P.Eng.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('6th Floor, 1810 Blanshard Street','PO Box 9320','Victoria','BC','V8W9N3','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Kelly','Franz','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','P.Geo.') RETURNING party_guid
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');

	with inserted_values as (
		insert into address (address_line_1, address_line_2, city, sub_division_code, post_code, address_type_code) values ('3rd Floor','1810 Blanshard Street','Victoria','BC','V8W9M9','CAN') returning address_id
	)
	select address_id from inserted_values into inserted_address_id;

	insert into party_address_xref (address_id, party_guid) values (inserted_address_id, inserted_party_guid);

END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Victor','Koyanagi','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines','P.Geo.') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Craig','Gentle','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Mineral Titles Inspector/Mines Inspector','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Peter','Bergholz','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Sean','Shaw','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Environmental Geoscientist','Ph.D., P.Geo.') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Chris','Newell','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Mineral Titles Inspector/Mines Inspector','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Paul','Hughes','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Geotechnical','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Cam','Scott','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Geotechnical','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Hermanus','Henning','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Deputy Chief Inspector of Mines','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Tania','Demchuk','250-952-0417', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Deputy Chief Inspector Compliance & Enforcement','MSc., P.Geo.') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Katelynn','Coutts','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Occupational Health','B.Sc.') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Greg','McLean','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Mechanical','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Rolly','Thorpe','250-952-0464', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Deputy Chief Inspector, Health & Safety','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Haley','Kuppers','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Inspector of Mines, Provincial Health & Safety Specialist','') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inserted_party_guid uuid;
DECLARE inserted_address_id integer;
BEGIN
	with inserted_values as (
		insert into party (first_name, party_name, phone_no, email, effective_date, create_user, update_user, party_type_code, job_title, postnominal_letters)
		values ('Heather','Narynski','', null, CURRENT_DATE, 'system-mds', 'system-mds', 'PER', 'Senior Inspector of Mines, Geotechnical','P.Eng.') RETURNING party_guid 
	)
	select party_guid from inserted_values into inserted_party_guid;
	
	insert into party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
		values (inserted_party_guid, 'INS', CURRENT_DATE, 'system-mds', 'system-mds');
END $$;


DO $$
DECLARE inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Laurie' and party_name='Meade' into inspector_party_guid;

END $$;

























