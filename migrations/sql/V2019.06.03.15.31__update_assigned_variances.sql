-- core_user_id |           email
--------------+----------------------------
--           67 | Greg.McLean@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Greg' and party_name='McLean' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=67;

END $$;


--           63 | Alan.Day@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Alan' and party_name='Day' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=63;

END $$;


--           49 | Barry.Tracey@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Barry' and party_name='Tracey' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=49;

END $$;


--           64 | Laurie.Meade@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Laurie' and party_name='Meade' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=64;

END $$;

--           51 | Andrew.Sinstadt@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Andrew' and party_name='Sinstadt' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=51;

END $$;


--           11 | Victor.Koyanagi@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Victor' and party_name='Koyanagi' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=11;

END $$;


--           52 | Blythe.Golobic@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Blythe' and party_name='Golobic' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=52;

END $$;


--           54 | Adrian.Pooley@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Adrian' and party_name='Pooley' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=54;

END $$;


--           68 | Jorge.Freitas@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Jorge' and party_name='Freitas' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=68;

END $$;


--           66 | James.V.Robinson@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='James' and party_name='Robinson' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=66;

END $$;


--            4 | Doug.Flynn@gov.bc.ca
DO $$
DECLARE inserted_inspector_party_guid uuid;
BEGIN

	SELECT party_guid from party where first_name='Doug' and party_name='Flynn' and job_title is not null into inserted_inspector_party_guid;
	UPDATE variance SET inspector_party_guid = inserted_inspector_party_guid WHERE inspector_id=4;

END $$;


