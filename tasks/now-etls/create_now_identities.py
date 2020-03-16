import psycopg2
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta


def create_and_update_now_identities(connection):
    with connection:
        cursor = connection.cursor()

        print('INSERT_NOW_SUBMISSION_IDENTITIES')
        INSERT_NOW_SUBMISSION_IDENTITIES = """
        INSERT INTO public.now_application_identity
        SELECT gen_random_uuid(), null, messageid, null, 'now-etl-mds', now(), 'now-etl-mds', now(), (SELECT mine_guid FROM public.mine WHERE public.mine.mine_no=now_submissions.application.minenumber limit 1) as mine_guid
        FROM now_submissions.application
        WHERE EXISTS (SELECT mine_guid FROM public.mine WHERE public.mine.mine_no=now_submissions.application.minenumber)
        AND NOT EXISTS (SELECT messageid from public.now_application_identity where public.now_application_identity.messageid=now_submissions.application.messageid);
        """
        cursor.execute(INSERT_NOW_SUBMISSION_IDENTITIES)

        print('UPDATE_MMS_CIDS_ON_EXISTING_NOW_IDENTITIES')
        UPDATE_MMS_CIDS_ON_EXISTING_NOW_IDENTITIES = """
        UPDATE public.now_application_identity SET mms_cid=(SELECT mms_cid FROM mms_now_submissions.application where messageid=now_application_identity.messageid),
        now_number=(SELECT CONCAT(minenumber, '-', substring(mmsnownumber from 1 for 4), '-',substring(mmsnownumber from 5 for 2) ) FROM mms_now_submissions.application where messageid=now_application_identity.messageid)
        FROM mms_now_submissions.application
        WHERE public.now_application_identity.messageid = mms_now_submissions.application.messageid;
        """
        cursor.execute(UPDATE_MMS_CIDS_ON_EXISTING_NOW_IDENTITIES)

        print('INSERT_NOW_IDENTITIES_FOR_MMS_ONLY_APPLICATIONS')
        INSERT_NOW_IDENTITIES_FOR_MMS_ONLY_APPLICATIONS = """
        INSERT INTO public.now_application_identity
        SELECT gen_random_uuid(), null, null, mms_cid, 'now-etl-mds', now(), 'now-etl-mds', now(), m.mine_guid
        FROM mms_now_submissions.application mnsa inner join public.mine m on m.mine_no = mnsa.minenumber
        where mms_cid NOT IN (SELECT distinct nai.mms_cid from public.now_application_identity nai where nai.mms_cid  is not null)
        """
        cursor.execute(INSERT_NOW_IDENTITIES_FOR_MMS_ONLY_APPLICATIONS)
