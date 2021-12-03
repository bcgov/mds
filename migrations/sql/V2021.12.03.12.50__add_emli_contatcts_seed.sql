  INSERT INTO emli_contact_type
    (
    emli_contact_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('ROE',  'Regional Office', 40, 'system-mds', 'system-mds'),
	  ('MMO',  'Major Mines Office', 10, 'system-mds', 'system-mds'),
	  ('CHI',  'Chief Inspector of Mines', 20, 'system-mds', 'system-mds'),
	  ('CHP',  'Chief Permitting Officer', 30, 'system-mds', 'system-mds'),
	  ('RDR',  'Regional Director', 50, 'system-mds', 'system-mds'),
	  ('SHI',  'Senior Health, Safety and Environment Inspector', 60, 'system-mds', 'system-mds'),
    ('SPI',  'Senior Permitting Inspector', 70, 'system-mds', 'system-mds'),
    ('HSI',  'Health and Safety Inspector', 80, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO emli_contact
  (
    emli_contact_type_code,
    mine_region_code,
    first_name,
    last_name,
    email,
    phone_number,
    fax_number,
    mailing_address_line_1,
    mailing_address_line_2,
    is_major_mine,
    is_general_contact,
    deleted_ind,
    create_user,
    update_user
  )
VALUES
  ('MMO', null,null,null,'PermRecl@gov.bc.ca',null,null,null,null,true, false, false, 'system-mds', 'system-mds'),
  ('CHI', null,'Hermanus','Henning','hermanus.henning@gov.bc.ca','778-974-5980',null,null,null,true, true, false, 'system-mds', 'system-mds'),
  ('CHP', null,'George','Warnock','brittanytownsend@gov.bc.ca','250-649-4339',null,null,null,true, true, false, 'system-mds', 'system-mds'),
  ('SHI','NW','Doug','Flynn','doug.flynn@gov.bc.ca','250-877-9747',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('RDR','NW','Howard','Davies','howard.davies@gov.bc.ca','250-876-8327',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('ROE','NW',null, null,'MMD-Smithers@gov.bc.ca','250 847-7383','250 847-7603','2nd Floor, 3726 Alfred Avenue','Smithers, B.C. V0J 2N0', false, false, false, 'system-mds', 'system-mds'),
  ('HSI','NW','Megan', 'Frederick','Megan.Frederick@gov.bc.ca','250-847-7214',null,null,null, true, false, false, 'system-mds', 'system-mds'),
  ('SPI','NW','Barry', 'MacCallum','Barry.MacCallum@gov.bc.ca','250-876-7041',null,null,null, false, false, false, 'system-mds', 'system-mds'),

  ('SHI','SW','Chris','Crawford','chris.crawford@gov.bc.ca','236-478-2428',null,null,null,false, false, false, 'system-mds', 'system-mds'),
  ('SPI','SW', 'Don','Harrison','donald.harrison@gov.bc.ca','778-698-7014',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('RDR','SW','Matthew','MacLean','matthew.maclean@gov.bc.ca','778-698-3649',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('ROE','SW', null, null,'SouthwestMinesDivision@gov.bc.ca','778 698-3649','250 953-3878','PO Box 9395, Stn Prov Govt','Victoria, B.C. V8W 9M9', false, false, false, 'system-mds', 'system-mds'),
  ('HSI','SW','Blythe', 'Golobic','Blythe.Golobic@gov.bc.ca','250-371-3915',null,null,null, true, false, false, 'system-mds', 'system-mds'),

  ('SHI','SC','Chris','LeClair','chris.leclair@gov.bc.ca','778-220-2076',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('SPI','SC','Mike','Cloet','mike.cloet@gov.bc.ca','250-312-7314',null,null,null,false, false, false, 'system-mds', 'system-mds'),
  ('RDR','SC','Ross','Hyam','ross.hyam@gov.bc.ca','250-985-0042',null,null,null,false, false, false, 'system-mds', 'system-mds'),
  ('ROE','SC',null, null, 'MMD-Kamloops@gov.bc.ca','250 371-3912','','2nd Floor, 441 Columbia Street','Kamloops, B.C. V2C 2T3', false, false, false, 'system-mds', 'system-mds'),
  ('HSI','SC','Blythe', 'Golobic','Blythe.Golobic@gov.bc.ca','250-371-3915',null,null,null, true,false, false, 'system-mds', 'system-mds'),

  ('SHI','NE','Brian','Oke','brian.oke@gov.bc.ca','250-565-4387',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('SPI','NE','Todd','Wikjord','todd.wikjord@gov.bc.ca','250-565-4234',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('RDR','NE','Marnie','Fraser','marnie.fraser@gov.bc.ca','250-565-4206',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('ROE','NE',null, null, 'MMD-PrinceGeorge@gov.bc.ca','250 565-4240','250 565-4328','350-1011 4th Avenue','Prince George, B.C. V2L 3H9', false, false, false, 'system-mds', 'system-mds'),
  ('HSI','NE','Kristopher', 'Bailey','Kristopher.Bailey@gov.bc.ca','250-565-4271',null,null,null, true, false, false, 'system-mds', 'system-mds'),

  ('SHI','SE','Jerrold','Jewsbury','jerrold.jewsbury@gov.bc.ca','250-417-6007',null,null,null, false, false, false, 'system-mds', 'system-mds'),
  ('SPI','SE', 'Glen','Hendrickson','glen.hendrickson@gov.bc.ca','250-420-6336',null,null,null,false, false, false, 'system-mds', 'system-mds'),
  ('RDR','SE','Kathie','Wagar','kathie.wagar@gov.bc.ca','250-417-6011',null,null,null,false, false, false, 'system-mds', 'system-mds'),
  ('ROE','SE',null, null, 'MMD-Cranbrook@gov.bc.ca','250 417-6134','','202-100 Cranbrook Street North','Cranbrook, B.C. V1C 3P9', false, false, false, 'system-mds', 'system-mds'),
  ('HSI','SE', 'Alan', 'Day','Alan.Day@gov.bc.ca','250-417-6013',null,null,null, true, false, false, 'system-mds', 'system-mds')
  ON CONFLICT DO NOTHING;
