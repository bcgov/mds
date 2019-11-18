import psycopg2
import uuid
import petl as etl
import itertools
from petl import timeparser
from datetime import datetime, time, timedelta

TABLES = [
    'application',
    'application_nda',
    'contact',
    'existing_placer_activity_xref',
    'exp_access_activity',
    'exp_surface_drill_activity',
    'mech_trenching_activity',
    'placer_activity',
    'proposed_placer_activity_xref',
    'sand_grv_qry_activity',
    'surface_bulk_sample_activity',
    'under_exp_new_activity',
    'under_exp_rehab_activity',
    'under_exp_surface_activity',
    'water_source_activity',
    'application_start_stop',
]

SANDGRVQRYEXCLUDE = "where cid not in ('1610619201301', '1610619201301', '1610619201301', '1610619201301', '1641179201301', '1641180201301', '0900204199901', '1500363201301', '0101302201301', '1650080201302', '1200007201301', '1640974201301', '1101939201301', '0101702201901', '1630649201301', '0900127201301', '1641174201301', '1630124201301', '1620269201301', '1641128201301', '1650234201301', '1630742201501', '1101692201702', '0900221201501', '0101525201501', '0900168201501', '0900168201502', '0900204201701', '1641474201701', '1641366201601', '1620702201601', '1630215201701', '0101228201601', '1620574201601', '1641330201602', '1620818201701', '0200279201701', '1641971201701', '1650885201601', '1631026201701', '0101046201601', '0900133201701', '1641254201402', '1641200201701', '1621397201401', '1650395201601', '0900102201401', '0800688201601', '0400625201501', '0900063201702', '1640993201701', '0900220201501', '0900217201501', '0101046201401', '1620010201501', '1641329201601', '0400426201701', '0900133201702', '1621438201501', '1642069201901', '0500368201501', '1641330201601', '1630513201601', '1640772201601', '1101246201501', '1641430201601', '0900204201703', '0900016201701', '1630734201501', '0101327201401', '1610675201501', '1650528201501', '0900204201702', '1641476201701', '1641013201402', '1620494201401', '1650617201701', '0900168201701', '1630539201701', '0900063201701', '1000409201601', '1640150201601', '1641384201601', '0800407201602', '1641119201401', '1650861201401', '1640847201601', '1620498201701', '0800612201701', '1641179201601', '0900163201601', '0501122201602', '1101692201701', '1630080201701', '0603333201701', '0200279201401', '0900223201501', '0700568201701', '0500297201701', '1640851201701', '1101122201401', '1641354201501', '1650611201501', '0400724201502', '1641281201401', '0500910201401', '0101050201501', '0900168201601', '0600402201601', '0900127201401', '0101684201401', '1630484201601', '1650080201401', '1650294201401', '1650816201301', '1641252201401', '0900222201501', '1650832201401', '1650892201501', '1641311201501', '0101228201501', '1620501201501', '1630292201501', '1630419201401', '1620335201402', '0900218201501', '1641256201501', '1640870201401', '0400724201501', '1650898201501', '1650902201501', '0101058201801', '1640983201701', '1640863201701', '0101098201901', '0400704201801', '1650615201901', '0101231201901', '1641200201901', '1640850201701', '1610376201801', '1630712201701', '0400056201703', '0900197201902', '1641200201902', '1631059201901', '0101703201901', '1621123201901', '1621636201701', '0800029201701', '0200381201901', '1500530201701', '1642042201801', '0101058201901', '1650617201901', '0900145201701', '1650087201901', '1650294201901', '1610632201901', '1640982201701', '1620381201801', '1650753201901', '1650563201901', '1631030201801', '0700541201801', '1640235201802', '1620291201701', '1630272201701', '1631056201701', '1641424201801', '0400625201901', '1650616201901', '1641060201701', '1621123201801', '1101529201801', '1620530201801', '1630646201901', '1640943201801', '0501178201701', '0400851201801', '1620381201802', '1641250201701', '1620332201801', '1640892201901', '1620269201801', '1640560201701', '1640982201901', '1642066201901', '0800695201901', '1650808201901', '1640857201801', '0900102201901', '1200007201801', '0200505201801', '1620322201801', '1650981201801', '1650982201801', '1641134201701', '0300512201801', '0400667201801', '1650832201901', '0101719201901', '0100789201901', '0500444201901', '0800106201901', '0600234201901', '0501258201801', '1640377201901', '0500147201901', '1610729201801', '1610393201801', '1641060201901', '1620291201801', '0800547201901', '1101122201901', '1500446201901', '1640850201901', '1641134201901', '1641170201901', '1640851201901', '0900102201902', '1000409201901', '0500122201901', '0500452201901', '1630708201801', '1640857201901', '1101122201902', '1640993201901', '1631042201801', '1640214201901', '1620335201701', '0300597201801', '0400056201801', '1641474201702', '1640677201901', '1620269201802', '1641182201901', '1610679201801', '0501178201901', '1610679201702', '1640892201701', '0101684201701', '1610724201801', '1642051201901', '1642051201901')"
SURFACEEXPEXCLUDE = "where cid not in ('0101172200001', '0600052200301', '0600330200202', '0603316200202', '1620223200201', '0600330200701', '1300245200701', '0200047200602', '1630307200701', '0501284200705', '1630328200701', '0501284200706', '0600330200702', '0600330200703', '0501284200701', '0101546200701', '0700038200701', '1300245200703', '1620687200701', '1610394200701', '0501284200702', '1610027200701', '1300245200702', '0501284200704', '1630376200801', '1610059200801', '1630382200802', '1300245200901', '1620030200801', '1630360200903', '1610059200901', '1640876200901', '1640878200901', '1630360200901', '1630360200902', '1640629200903', '1610059200902', '1630382201001', '1630479201001', '1630417200902', '1630417201001', '0300423201101', '1630572201102', '0603383201402', '0300010201502', '0500725201502', '1650911201501', '1200003201301', '1640549201402', '1101250201301', '1621076201201', '0300010201501', '1300696201501', '1630737201501', '1000949201301', '1620134201501', '0100088201601', '1621425201601', '1620666201401', '0100455201301', '1300114201502', '1630560201301', '0600338201308', '1621030201501', '1200003201303', '0700141200701', '1630740201501', '1621151201501', '1641327201501', '1630506201301', '1621263201301', '1650798201401', '1000032201501', '0100359201401', '1650836201501', '0500603201401', '1630716201401', '1650761201402', '1640549201501', '1620666201302', '1650367201301', '1650798201301', '1300244201402', '1620666201306', '1620469201201', '0501284201001', '0603383201401', '1630586201401', '1620544201301', '1620473201402', '1620810201402', '1630376201101', '1500121201301', '1620658201401', '1630572201101', '1650761201401', '1620473201401', '1620810201401', '1641062201102', '1641196201301', '1650807201301', '0101121201801', '1650961201701', '1640607201802', '1650846201801', '1640593201801', '1621030201801', '1630326201801', '1650955201801', '1610709201701', '1300245201701', '0101399201801', '1650279201901', '1620221201603', '0200285201901', '0600338201901', '1650526201901', '0100542201802', '1640745201901', '0900011201901', '0501026201902', '1620473201901', '1620810201901', '1642019201902', '0300010201801', '0100028201801', '1650798201901', '1650544201601', '1631057201901', '1641327201701', '1650949201702', '1620906201601', '0400056201702', '0101299201702', '1641458201702', '0500099201702', '1630619201601', '1300281201701', '0500099201701', '1300328201601', '0400056201701', '1500125201705', '0100325201701', '0101396201801', '0100144201801', '0101399201701', '0500014201701', '0100512201801', '1620907201801', '1630601201801', '0900004201601', '1000032201701', '1620906201701', '0101178201601', '1650664201901', '0101579201901', '1650415201901', '1620561201902', '1650846201901', '1650846201601', '1650949201701', '1630501201801', '1630516201801', '1630173201601', '1640121201901', '1300506201901', '0101265201902', '0101632201901', '1610709201901', '1621741201901', '1300440201901', '0300150201601', '1650911201701', '0101466201802', '1200008201901', '0100419201701', '1650798201801', '0500319201601', '0300010201903', '0500725201601', '1620905201901', '0100028201701', '0101581201701', '0500014201801', '1610709201801', '1630358201801', '0101459201801', '1650284201801', '0100071201601', '1650671201701', '0200089201801', '1620907201602', '0300411201801', '0101396201701', '1500125201701', '1650279201701', '1621744201901', '0200178201601', '1650955201701', '1300473201602', '1641475201701', '1500125201601', '1300328201701', '0101364201901', '1630654201601', '0101003201701', '0500006201702', '0500086201701', '0100824201601', '1630379201701', '0600254201801', '1620785201901', '1640340201902', '1641004201901')"

def truncate_table(connection, tables):
    cursor = connection.cursor()
    for table in tables:
        print(f'Truncating {table}...')
        cursor.execute(f'TRUNCATE TABLE mms_now_submissions.{table} RESTART IDENTITY CASCADE;')

def ETL_MMS_NOW_schema(connection, tables):
    '''Import all the data from the specified schema and tables.'''
    try:
        applications = etl.fromdb(
            connection,
            f'SELECT msg_id as messageid, cid as mms_cid, mine_no as minenumber, apl_dt as submitteddate, lat_dec, lon_dec, multi_year_ind, multi_year_area_ind, str_Dt as ProposedStartDate, end_dt as ProposedEndDate, site_desc as SiteDirections, prpty_nm as NameOfProperty, apl_typ from mms.mmsnow'
        )

        now_number_mineral = etl.fromdb(
            connection,
            'SELECT cid as mms_cid, upd_no as mmsnownumber from mms.mmsmnw'
        )

        now_number_placer = etl.fromdb(
            connection,
            'SELECT cid as mms_cid, upd_no as mmsnownumber from mms.mmspnw'
        )

        applications = etl.addfield(
            applications, 'noticeofworktype',
            lambda v: 'Mineral' if v['apl_typ'] == 'M' else ('Placer Operations' if v['apl_typ'] == 'P' else 'Sand & Gravel')
        )
        applications = etl.addfield(
            applications, 'latitude',
            lambda v: None if v['lat_dec'] > 90 or v['lat_dec'] < -90 else v['lat_dec']
        )

        applications = etl.addfield(
            applications, 'longitude',
            lambda v: None if v['lon_dec'] > 180 or v['lon_dec'] < -180 else v['lon_dec']
        )

        applications = etl.cutout(applications, 'apl_typ', 'lat_dec', 'lon_dec')

        message_ids = etl.cut(applications, 'mms_cid', 'messageid')

        applications = etl.addfield(
            applications, 'typeofpermit',
            lambda v: 'I would like to apply for a Multi-Year, Area Based permit' if v['multi_year_area_ind'] == 1 else ('I would like to apply for a Multi-Year permit' if v['multi_year_ind'] == 1 else None)
        )
        applications = etl.cutout(applications, 'multi_year_area_ind')
        applications = etl.cutout(applications, 'multi_year_ind')

        applications = etl.leftjoin(applications, now_number_mineral, key='mms_cid')
        applications = etl.leftjoin(applications, now_number_placer, key='mms_cid')

        sand_grv_qry_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as sandgrvqryreclamation, recl_dol as sandgrvqryreclamationcost, backslope as sandgrvqryreclamationbackfill, oper1_ind, oper2_ind, oper3_ind, alr_ind as sandgrvqrywithinaglandres, srb_ind as sandgrvqrylocalgovsoilrembylaw, pdist_ar as sandgrvqrydisturbedarea, t_vol as sandgrvqrytimbervolume, edist_Ar as sandgrvqrytotalexistdistarea, act1_ind, act2_ind, act3_ind, act4_ind, act1_ar, act2_ar, act3_ar, act4_ar, act1_vol, act2_vol, act3_vol, act4_vol from mms.mmssci_n {SANDGRVQRYEXCLUDE}'
        )

        sand_grv_qry_activity_app_cols = etl.cut(sand_grv_qry_activity, 
            'mms_cid', 'oper1_ind', 'oper2_ind', 'oper3_ind', 'sandgrvqryreclamation',
            'sandgrvqryreclamationcost', 'sandgrvqryreclamationbackfill',
            'sandgrvqrywithinaglandres', 'sandgrvqrylocalgovsoilrembylaw',
            'sandgrvqrytotalexistdistarea', 'sandgrvqrydisturbedarea', 'sandgrvqrytimbervolume',
        )

        sand_grv_qry_activity = etl.cutout(sand_grv_qry_activity, 
            'oper1_ind', 'oper2_ind', 'oper3_ind', 'sandgrvqryreclamation',
            'sandgrvqryreclamationcost', 'sandgrvqryreclamationbackfill',
            'sandgrvqrywithinaglandres', 'sandgrvqrylocalgovsoilrembylaw',
            'sandgrvqrytotalexistdistarea'
        )
        
        sand_grv_qry_activity_app_cols = etl.addfield(
            sand_grv_qry_activity_app_cols, 'yearroundseasonal',
            lambda v: 'Year Round' if v['oper1_ind'] == 1 else ('Seasonal' if v['oper2_ind'] == 1 else 'Intermittent')
        )

        sand_grv_qry_activity_app_cols = etl.cutout(sand_grv_qry_activity_app_cols,
                                                    'oper1_ind', 'oper2_ind', 'oper3_ind')

        sand_grv_qry_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.sand_grv_qry_activity'
        )

        sand_grv_qry_activity_detail = etl.cutout(sand_grv_qry_activity_detail, 'messageid', 'id')
        
        sand_grv_qry_activity_1 = etl.cut(sand_grv_qry_activity, 
            'mms_cid', 'act1_ind', 'act1_ar', 'act1_vol'
        )

        sand_grv_qry_activity_2 = etl.cut(sand_grv_qry_activity, 
            'mms_cid', 'act2_ind', 'act2_ar', 'act2_vol'
        )

        sand_grv_qry_activity_3 = etl.cut(sand_grv_qry_activity, 
            'mms_cid', 'act3_ind', 'act3_ar', 'act3_vol'
        )

        sand_grv_qry_activity_4 = etl.cut(sand_grv_qry_activity, 
            'mms_cid', 'act4_ind', 'act4_ar', 'act4_vol'
        )

        sand_grv_qry_activity_1 = etl.select(sand_grv_qry_activity_1, lambda v: v['act1_ind'] == 1)
        sand_grv_qry_activity_2 = etl.select(sand_grv_qry_activity_2, lambda v: v['act2_ind'] == 1)
        sand_grv_qry_activity_3 = etl.select(sand_grv_qry_activity_3, lambda v: v['act3_ind'] == 1)
        sand_grv_qry_activity_4 = etl.select(sand_grv_qry_activity_4, lambda v: v['act4_ind'] == 1)
        
    
        sand_grv_qry_activity_1 = etl.addfield(sand_grv_qry_activity_1, 'type','Excavation of Pit Run')
        sand_grv_qry_activity_1 = etl.addfield(sand_grv_qry_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        sand_grv_qry_activity_1 = etl.addfield(sand_grv_qry_activity_1, 'timbervolume', lambda v: v['act1_vol'])

        sand_grv_qry_activity_1 = etl.cutout(sand_grv_qry_activity_1, 'act1_ind', 'act1_ar', 'act1_vol')

        sand_grv_qry_activity_detail = etl.cat(sand_grv_qry_activity_detail, sand_grv_qry_activity_1)

    
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'type','Crushing')
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'timbervolume', lambda v: v['act2_vol'])

        sand_grv_qry_activity_2 = etl.cutout(sand_grv_qry_activity_2, 'act2_ind', 'act2_ar', 'act2_vol')

        sand_grv_qry_activity_detail = etl.cat(sand_grv_qry_activity_detail, sand_grv_qry_activity_2)

    
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'type','Mechanical Screening')
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'timbervolume', lambda v: v['act3_vol'])

        sand_grv_qry_activity_3 = etl.cutout(sand_grv_qry_activity_3, 'act3_ind', 'act3_ar', 'act3_vol')

        sand_grv_qry_activity_detail = etl.cat(sand_grv_qry_activity_detail, sand_grv_qry_activity_3)

    
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'type','Washing')
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'timbervolume', lambda v: v['act4_vol'])

        sand_grv_qry_activity_4 = etl.cutout(sand_grv_qry_activity_4, 'act4_ind', 'act4_ar', 'act4_vol')

        sand_grv_qry_activity_detail = etl.cat(sand_grv_qry_activity_detail, sand_grv_qry_activity_4)
        
        sand_grv_qry_activity_detail = etl.leftjoin(message_ids, sand_grv_qry_activity_detail, key='mms_cid')
        applications = etl.leftjoin(applications, sand_grv_qry_activity_app_cols, key='mms_cid')

        surface_bulk_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as surfacebulksamplereclamation, recl_dol as surfacebulksamplereclcost, material_desc as surfacebulksamplereclsephandl, drainage_desc as surfacebulksamplerecldrainmiti, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol  from mms.mmsscf_n'
        )

        surface_bulk_activity_app_cols = etl.cut(surface_bulk_activity, 'mms_cid', 'surfacebulksamplereclamation', 'surfacebulksamplereclcost', 'surfacebulksamplereclsephandl', 'surfacebulksamplerecldrainmiti')

        surface_bulk_activity = etl.cutout(surface_bulk_activity, 'surfacebulksamplereclamation', 'surfacebulksamplereclcost', 'surfacebulksamplereclsephandl', 'surfacebulksamplerecldrainmiti')

        surface_bulk_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.surface_bulk_sample_activity'
        )

        surface_bulk_activity_detail = etl.cutout(surface_bulk_activity_detail, 'messageid', 'id')
        
        surface_bulk_activity_1 = etl.cut(surface_bulk_activity, 'mms_cid', 'act1_ind', 'act1_ar', 'act1_vol')

        surface_bulk_activity_2 = etl.cut(surface_bulk_activity, 'mms_cid', 'act2_ind', 'act2_ar', 'act2_vol')

        surface_bulk_activity_3 = etl.cut(surface_bulk_activity, 'mms_cid', 'act3_ind', 'act3_ar', 'act3_vol')

        surface_bulk_activity_4 = etl.cut(surface_bulk_activity, 'mms_cid', 'act4_ind', 'act4_ar', 'act4_vol')
        
        surface_bulk_activity_5 = etl.cut(surface_bulk_activity, 'mms_cid', 'act5_ind', 'act5_ar', 'act5_vol')

        surface_bulk_activity_6 = etl.cut(surface_bulk_activity, 'mms_cid', 'act6_ind', 'act6_ar', 'act6_vol')

        surface_bulk_activity_1 = etl.select(surface_bulk_activity_1, lambda v: v['act1_ind'] == 1)
        surface_bulk_activity_2 = etl.select(surface_bulk_activity_2, lambda v: v['act2_ind'] == 1)
        surface_bulk_activity_3 = etl.select(surface_bulk_activity_3, lambda v: v['act3_ind'] == 1)
        surface_bulk_activity_4 = etl.select(surface_bulk_activity_4, lambda v: v['act4_ind'] == 1)
        surface_bulk_activity_5 = etl.select(surface_bulk_activity_5, lambda v: v['act5_ind'] == 1)
        surface_bulk_activity_6 = etl.select(surface_bulk_activity_6, lambda v: v['act6_ind'] == 1)


        surface_bulk_activity_1 = etl.addfield(surface_bulk_activity_1, 'type','Bulk Sample')
        surface_bulk_activity_1 = etl.addfield(surface_bulk_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        surface_bulk_activity_1 = etl.addfield(surface_bulk_activity_1, 'timbervolume', lambda v: v['act1_vol'])

        surface_bulk_activity_1 = etl.cutout(surface_bulk_activity_1, 'act1_ind', 'act1_ar', 'act1_vol')

        surface_bulk_activity_detail = etl.cat(surface_bulk_activity_detail, surface_bulk_activity_1)


        surface_bulk_activity_2 = etl.addfield(surface_bulk_activity_2, 'type','Overburden')
        surface_bulk_activity_2 = etl.addfield(surface_bulk_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        surface_bulk_activity_2 = etl.addfield(surface_bulk_activity_2, 'timbervolume', lambda v: v['act2_vol'])

        surface_bulk_activity_2 = etl.cutout(surface_bulk_activity_2, 'act2_ind', 'act2_ar', 'act2_vol')

        surface_bulk_activity_detail = etl.cat(surface_bulk_activity_detail, surface_bulk_activity_2)


        surface_bulk_activity_3 = etl.addfield(surface_bulk_activity_3, 'type','Topsoil')
        surface_bulk_activity_3 = etl.addfield(surface_bulk_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        surface_bulk_activity_3 = etl.addfield(surface_bulk_activity_3, 'timbervolume', lambda v: v['act3_vol'])

        surface_bulk_activity_3 = etl.cutout(surface_bulk_activity_3, 'act3_ind', 'act3_ar', 'act3_vol')

        surface_bulk_activity_detail = etl.cat(surface_bulk_activity_detail, surface_bulk_activity_3)


        surface_bulk_activity_4 = etl.addfield(surface_bulk_activity_4, 'type','Waste Dumps')
        surface_bulk_activity_4 = etl.addfield(surface_bulk_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        surface_bulk_activity_4 = etl.addfield(surface_bulk_activity_4, 'timbervolume', lambda v: v['act4_vol'])

        surface_bulk_activity_4 = etl.cutout(surface_bulk_activity_4, 'act4_ind', 'act4_ar', 'act4_vol')

        surface_bulk_activity_detail = etl.cat(surface_bulk_activity_detail, surface_bulk_activity_4)


        surface_bulk_activity_5 = etl.addfield(surface_bulk_activity_5, 'type','Equipment and Service Facilities')
        surface_bulk_activity_5 = etl.addfield(surface_bulk_activity_5, 'disturbedarea', lambda v: v['act5_ar'])
        surface_bulk_activity_5 = etl.addfield(surface_bulk_activity_5, 'timbervolume', lambda v: v['act5_vol'])

        surface_bulk_activity_5 = etl.cutout(surface_bulk_activity_5, 'act5_ind', 'act5_ar', 'act5_vol')

        surface_bulk_activity_detail = etl.cat(surface_bulk_activity_detail, surface_bulk_activity_5)

        surface_bulk_activity_6 = etl.addfield(surface_bulk_activity_6, 'type','Processing Facilities')
        surface_bulk_activity_6 = etl.addfield(surface_bulk_activity_6, 'disturbedarea', lambda v: v['act6_ar'])
        surface_bulk_activity_6 = etl.addfield(surface_bulk_activity_6, 'timbervolume', lambda v: v['act6_vol'])

        surface_bulk_activity_6 = etl.cutout(surface_bulk_activity_6, 'act6_ind', 'act6_ar', 'act6_vol')

        surface_bulk_activity_detail = etl.cat(surface_bulk_activity_detail, surface_bulk_activity_6)

        surface_bulk_activity_detail = etl.leftjoin(message_ids, surface_bulk_activity_detail, key='mms_cid')
        applications = etl.leftjoin(applications, surface_bulk_activity_app_cols, key='mms_cid')

        cut_lines = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, line_km as cutlinesexplgridtotallinekms, t_vol as cutlinesexplgridtimbervolume, recl_desc as cutlinesreclamation, recl_dol as cutlinesreclamationcost, t_ar as cutlinesexplgriddisturbedarea from mms.mmssco_n'
        )

        applications = etl.leftjoin(applications, cut_lines, key='mms_cid')

        exploration_access = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as expaccessreclamation, recl_dol as expaccessreclamationcost, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act7_ind, act1_len, act2_len, act3_len, act4_len, act5_len, act6_len, act7_len, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act7_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol, act7_vol from mms.mmssce_n'
        )

        exploration_access_app_cols = etl.cut(exploration_access, 'mms_cid', 'expaccessreclamation', 'expaccessreclamationcost')

        exploration_access = etl.cutout(exploration_access, 'expaccessreclamation', 'expaccessreclamationcost')

        exploration_access_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.exp_access_activity'
        )

        exploration_access_activity_detail = etl.cutout(exploration_access_activity_detail, 'messageid', 'id')
        
        exploration_access_activity_1 = etl.cut(exploration_access, 'mms_cid', 'act1_ind', 'act1_len', 'act1_ar', 'act1_vol')

        exploration_access_activity_2 = etl.cut(exploration_access, 'mms_cid', 'act2_ind', 'act2_len', 'act2_ar', 'act2_vol')

        exploration_access_activity_3 = etl.cut(exploration_access, 'mms_cid', 'act3_ind', 'act3_len', 'act3_ar', 'act3_vol')

        exploration_access_activity_4 = etl.cut(exploration_access, 'mms_cid', 'act4_ind', 'act4_len', 'act4_ar', 'act4_vol')
        
        exploration_access_activity_5 = etl.cut(exploration_access, 'mms_cid', 'act5_ind', 'act5_len', 'act5_ar', 'act5_vol')

        exploration_access_activity_6 = etl.cut(exploration_access, 'mms_cid', 'act6_ind', 'act6_len', 'act6_ar', 'act6_vol')

        exploration_access_activity_7 = etl.cut(exploration_access, 'mms_cid', 'act7_ind', 'act7_len', 'act7_ar', 'act7_vol')

        exploration_access_activity_1 = etl.select(exploration_access_activity_1, lambda v: v['act1_ind'] == 1)
        exploration_access_activity_2 = etl.select(exploration_access_activity_2, lambda v: v['act2_ind'] == 1)
        exploration_access_activity_3 = etl.select(exploration_access_activity_3, lambda v: v['act3_ind'] == 1)
        exploration_access_activity_4 = etl.select(exploration_access_activity_4, lambda v: v['act4_ind'] == 1)
        exploration_access_activity_5 = etl.select(exploration_access_activity_5, lambda v: v['act5_ind'] == 1)
        exploration_access_activity_6 = etl.select(exploration_access_activity_6, lambda v: v['act6_ind'] == 1)
        exploration_access_activity_7 = etl.select(exploration_access_activity_7, lambda v: v['act7_ind'] == 1)


        exploration_access_activity_1 = etl.addfield(exploration_access_activity_1, 'type','Excavated Trail - New')
        exploration_access_activity_1 = etl.addfield(exploration_access_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        exploration_access_activity_1 = etl.addfield(exploration_access_activity_1, 'timbervolume', lambda v: v['act1_vol'])
        exploration_access_activity_1 = etl.addfield(exploration_access_activity_1, 'length', lambda v: v['act1_len'])

        exploration_access_activity_1 = etl.cutout(exploration_access_activity_1, 'act1_ind', 'act1_len', 'act1_ar', 'act1_vol')

        exploration_access_activity_detail = etl.cat(exploration_access_activity_detail, exploration_access_activity_1)


        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'type','Temporary Road - New')
        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'timbervolume', lambda v: v['act2_vol'])
        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'length', lambda v: v['act2_len'])

        exploration_access_activity_2 = etl.cutout(exploration_access_activity_2, 'act2_ind', 'act2_len', 'act2_ar', 'act2_vol')

        exploration_access_activity_detail = etl.cat(exploration_access_activity_detail, exploration_access_activity_2)


        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'type','Exploration Trail or Exploration Trail - New')
        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'timbervolume', lambda v: v['act3_vol'])
        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'length', lambda v: v['act3_len'])

        exploration_access_activity_3 = etl.cutout(exploration_access_activity_3, 'act3_ind', 'act3_len', 'act3_ar', 'act3_vol')

        exploration_access_activity_detail = etl.cat(exploration_access_activity_detail, exploration_access_activity_3)


        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'type','Excavated Trail - Modification or Existing Access Modification')
        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'timbervolume', lambda v: v['act4_vol'])
        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'length', lambda v: v['act4_len'])

        exploration_access_activity_4 = etl.cutout(exploration_access_activity_4, 'act4_ind', 'act4_len', 'act4_ar', 'act4_vol')

        exploration_access_activity_detail = etl.cat(exploration_access_activity_detail, exploration_access_activity_4)


        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'type','Helicopter Pad(s)')
        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'disturbedarea', lambda v: v['act5_ar'])
        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'timbervolume', lambda v: v['act5_vol'])
        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'length', lambda v: v['act5_len'])
 
        exploration_access_activity_5 = etl.cutout(exploration_access_activity_5, 'act5_ind', 'act5_len', 'act5_ar', 'act5_vol')

        exploration_access_activity_detail = etl.cat(exploration_access_activity_detail, exploration_access_activity_5)


        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'type','Processing Facilities')
        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'disturbedarea', lambda v: v['act6_ar'])
        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'timbervolume', lambda v: v['act6_vol'])
        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'length', lambda v: v['act6_len'])

        exploration_access_activity_6 = etl.cutout(exploration_access_activity_6, 'act6_ind', 'act6_len', 'act6_ar', 'act6_vol')

        exploration_access_activity_detail = etl.cat(exploration_access_activity_detail, exploration_access_activity_6)


        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'type','Temporary Air Strip')
        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'disturbedarea', lambda v: v['act7_ar'])
        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'timbervolume', lambda v: v['act7_vol'])
        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'length', lambda v: v['act7_len'])

        exploration_access_activity_7 = etl.cutout(exploration_access_activity_7, 'act7_ind', 'act7_len', 'act7_ar', 'act7_vol')

        exploration_access_activity_detail = etl.cat(exploration_access_activity_detail, exploration_access_activity_7)

        exploration_access_activity_detail = etl.leftjoin(message_ids, exploration_access_activity_detail, key='mms_cid')
        applications = etl.leftjoin(applications, exploration_access_app_cols, key='mms_cid')

        exploration_surface_drill = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as expsurfacedrillreclamation, recl_dol as expsurfacedrillreclamationcost, storage_desc as expsurfacedrillreclcorestorage, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act7_ind, act8_ind, act1_cnt, act2_cnt, act3_cnt, act4_cnt, act5_cnt, act6_cnt, act7_cnt, act8_cnt, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act7_ar, act8_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol, act7_vol, act8_vol from mms.mmsscd_n {SURFACEEXPEXCLUDE}'
        )

        exploration_surface_drill_app_cols = etl.cut(exploration_surface_drill, 'mms_cid', 'expsurfacedrillreclamation', 'expsurfacedrillreclamationcost', 'expsurfacedrillreclcorestorage')

        exploration_surface_drill = etl.cutout(exploration_surface_drill, 'expsurfacedrillreclamation', 'expsurfacedrillreclamationcost', 'expsurfacedrillreclcorestorage')

        exploration_surface_drill_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.exp_access_activity'
        )

        exploration_surface_drill_activity_detail = etl.cutout(exploration_surface_drill_activity_detail, 'messageid', 'id')
        
        exploration_surface_drill_activity_1 = etl.cut(exploration_surface_drill, 'mms_cid', 'act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol')

        exploration_surface_drill_activity_2 = etl.cut(exploration_surface_drill, 'mms_cid', 'act2_ind', 'act2_cnt', 'act2_ar', 'act2_vol')

        exploration_surface_drill_activity_3 = etl.cut(exploration_surface_drill, 'mms_cid', 'act3_ind', 'act3_cnt', 'act3_ar', 'act3_vol')

        exploration_surface_drill_activity_4 = etl.cut(exploration_surface_drill, 'mms_cid', 'act4_ind', 'act4_cnt', 'act4_ar', 'act4_vol')
        
        exploration_surface_drill_activity_5 = etl.cut(exploration_surface_drill, 'mms_cid', 'act5_ind', 'act5_cnt', 'act5_ar', 'act5_vol')

        exploration_surface_drill_activity_6 = etl.cut(exploration_surface_drill, 'mms_cid', 'act6_ind', 'act6_cnt', 'act6_ar', 'act6_vol')

        exploration_surface_drill_activity_7 = etl.cut(exploration_surface_drill, 'mms_cid', 'act7_ind', 'act7_cnt', 'act7_ar', 'act7_vol')

        exploration_surface_drill_activity_8 = etl.cut(exploration_surface_drill, 'mms_cid', 'act8_ind', 'act8_cnt', 'act8_ar', 'act8_vol')

        exploration_surface_drill_activity_1 = etl.select(exploration_surface_drill_activity_1, lambda v: v['act1_ind'] == 1)
        exploration_surface_drill_activity_2 = etl.select(exploration_surface_drill_activity_2, lambda v: v['act2_ind'] == 1)
        exploration_surface_drill_activity_3 = etl.select(exploration_surface_drill_activity_3, lambda v: v['act3_ind'] == 1)
        exploration_surface_drill_activity_4 = etl.select(exploration_surface_drill_activity_4, lambda v: v['act4_ind'] == 1)
        exploration_surface_drill_activity_5 = etl.select(exploration_surface_drill_activity_5, lambda v: v['act5_ind'] == 1)
        exploration_surface_drill_activity_6 = etl.select(exploration_surface_drill_activity_6, lambda v: v['act6_ind'] == 1)
        exploration_surface_drill_activity_7 = etl.select(exploration_surface_drill_activity_7, lambda v: v['act7_ind'] == 1)
        exploration_surface_drill_activity_8 = etl.select(exploration_surface_drill_activity_8, lambda v: v['act8_ind'] == 1)


        exploration_surface_drill_activity_1 = etl.addfield(exploration_surface_drill_activity_1, 'type','Diamond Drilling - Surface')
        exploration_surface_drill_activity_1 = etl.addfield(exploration_surface_drill_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        exploration_surface_drill_activity_1 = etl.addfield(exploration_surface_drill_activity_1, 'timbervolume', lambda v: v['act1_vol'])
        exploration_surface_drill_activity_1 = etl.addfield(exploration_surface_drill_activity_1, 'numberofsites', lambda v: v['act1_cnt'])

        exploration_surface_drill_activity_1 = etl.cutout(exploration_surface_drill_activity_1, 'act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_1)


        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'type','Diamond Drilling - Underground')
        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'timbervolume', lambda v: v['act2_vol'])
        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'numberofsites', lambda v: v['act2_cnt'])

        exploration_surface_drill_activity_2 = etl.cutout(exploration_surface_drill_activity_2, 'act2_ind', 'act2_len', 'act2_ar', 'act2_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_2)


        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'type','Geotechnical')
        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'timbervolume', lambda v: v['act3_vol'])
        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'numberofsites', lambda v: v['act3_cnt'])

        exploration_surface_drill_activity_3 = etl.cutout(exploration_surface_drill_activity_3, 'act3_ind', 'act3_len', 'act3_ar', 'act3_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_3)


        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'type','Reverse Circulation')
        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'timbervolume', lambda v: v['act4_vol'])
        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'numberofsites', lambda v: v['act4_cnt'])

        exploration_surface_drill_activity_4 = etl.cutout(exploration_surface_drill_activity_4, 'act4_ind', 'act4_len', 'act4_ar', 'act4_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_4)


        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'type','Percussion')
        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'disturbedarea', lambda v: v['act5_ar'])
        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'timbervolume', lambda v: v['act5_vol'])
        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'numberofsites', lambda v: v['act5_cnt'])
 
        exploration_access_activity_5 = etl.cutout(exploration_surface_drill_activity_5, 'act5_ind', 'act5_len', 'act5_ar', 'act5_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_5)


        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'type','Becker')
        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'disturbedarea', lambda v: v['act6_ar'])
        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'timbervolume', lambda v: v['act6_vol'])
        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'numberofsites', lambda v: v['act6_cnt'])

        exploration_surface_drill_activity_6 = etl.cutout(exploration_surface_drill_activity_6, 'act6_ind', 'act6_len', 'act6_ar', 'act6_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_6)


        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'type','Sonic')
        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'disturbedarea', lambda v: v['act7_ar'])
        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'timbervolume', lambda v: v['act7_vol'])
        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'numberofsites', lambda v: v['act7_cnt'])

        exploration_surface_drill_activity_7 = etl.cutout(exploration_surface_drill_activity_7, 'act7_ind', 'act7_len', 'act7_ar', 'act7_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_7)

        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'type','Temporary Air Strip')
        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'disturbedarea', lambda v: v['act8_ar'])
        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'timbervolume', lambda v: v['act8_vol'])
        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'numberofsites', lambda v: v['act8_cnt'])

        exploration_surface_drill_activity_8 = etl.cutout(exploration_surface_drill_activity_8, 'act8_ind', 'act8_len', 'act8_ar', 'act8_vol')

        exploration_surface_drill_activity_detail = etl.cat(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_8)

        exploration_surface_drill_activity_detail = etl.leftjoin(message_ids, exploration_surface_drill_activity_detail, key='mms_cid')
        applications = etl.leftjoin(applications, exploration_surface_drill_app_cols, key='mms_cid')

        mech_trenching = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as mechtrenchingreclamation, recl_dol as mechtrenchingreclamationcost, act1_ind, act2_ind, act1_cnt, act2_cnt, act1_ar, act2_ar, act1_vol, act2_vol from mms.mmsscb_n'
        )

        mech_trenching_app_cols = etl.cut(mech_trenching, 'mms_cid', 'mechtrenchingreclamation', 'mechtrenchingreclamationcost')

        mech_trenching = etl.cutout(mech_trenching, 'mechtrenchingreclamation', 'mechtrenchingreclamationcost')

        mech_trenching_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.mech_trenching_activity'
        )

        mech_trenching_activity_detail = etl.cutout(mech_trenching_activity_detail, 'messageid', 'id')
        
        mech_trenching_activity_1 = etl.cut(mech_trenching, 'mms_cid', 'act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol')

        mech_trenching_activity_2 = etl.cut(mech_trenching, 'mms_cid', 'act2_ind', 'act2_cnt', 'act2_ar', 'act2_vol')

        mech_trenching_activity_1 = etl.select(mech_trenching_activity_1, lambda v: v['act1_ind'] == 1)
        mech_trenching_activity_2 = etl.select(mech_trenching_activity_2, lambda v: v['act2_ind'] == 1)
    
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'type','Trenches and Test Pits')
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'timbervolume', lambda v: v['act1_vol'])
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'numberofsites', lambda v: v['act1_cnt'])

        mech_trenching_activity_1 = etl.cutout(mech_trenching_activity_1, 'act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol')

        mech_trenching_activity_detail = etl.cat(mech_trenching_activity_detail, mech_trenching_activity_1)
    
        mech_trenching_activity_2 = etl.addfield(mech_trenching_activity_2, 'type','Stockpiles')
        mech_trenching_activity_2 = etl.addfield(mech_trenching_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        mech_trenching_activity_2 = etl.addfield(mech_trenching_activity_2, 'timbervolume', lambda v: v['act2_vol'])
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'numberofsites', lambda v: v['act2_cnt'])

        mech_trenching_activity_2 = etl.cutout(mech_trenching_activity_2, 'act2_ind', 'act2_cnt', 'act2_ar', 'act2_vol')

        mech_trenching_activity_detail = etl.cat(mech_trenching_activity_detail, mech_trenching_activity_2)

        mech_trenching_activity_detail = etl.leftjoin(message_ids, mech_trenching_activity_detail, key='mms_cid')
        applications = etl.leftjoin(applications, mech_trenching_app_cols, key='mms_cid')

        under_exp_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as underexpreclamation, recl_dol as underexpreclamationcost, t_ar as underexpsurfacetotaldistarea, t_vol as underexpsurfacetimbervolume, devr1_ind, devr2_ind, devr3_ind, devr4_ind, devr5_ind, devr6_ind, devr7_ind, devr8_ind, devr1_ct, devr2_ct, devr3_ct, devr4_ct, devr5_ct, devr6_ct, devr7_ct, devr8_ct, devn1_ind, devn2_ind, devn3_ind, devn4_ind, devn5_ind, devn6_ind, devn7_ind, devn8_ind, devn1_ct, devn2_ct, devn3_ct, devn4_ct, devn5_ct, devn6_ct, devn7_ct, devn8_ct, surf1_ind, surf2_ind, surf3_ind, surf4_ind, surf7_ind, surf8_ind, surf9_ind, surf10_ind, surf1_ct, surf2_ct, surf3_ct, surf4_ct, surf7_ct, surf8_ct, surf9_ct, surf10_ct, surf1_ar, surf2_ar, surf3_ar, surf4_ar, surf7_ar, surf8_ar, surf9_ar, surf10_ar, surf1_vol, surf2_vol, surf3_vol, surf4_vol, surf7_vol, surf8_vol, surf9_vol, surf10_vol from mms.mmsscg_n'
        )

        under_exp_activity_app_cols = etl.cut(under_exp_activity, 'mms_cid', 'underexpreclamation', 'underexpreclamationcost', 'underexpsurfacetotaldistarea', 'underexpsurfacetimbervolume')

        under_exp_activity = etl.cutout(under_exp_activity, 'underexpreclamation', 'underexpreclamationcost', 'underexpsurfacetotaldistarea', 'underexpsurfacetimbervolume')
        
        under_exp_surface_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.under_exp_surface_activity'
        )

        under_exp_surface_activity_detail = etl.cutout(under_exp_surface_activity_detail, 'messageid', 'id')

        under_exp_surface_activity_1 = etl.cut(under_exp_activity, 'mms_cid', 'surf1_ind', 'surf1_ct', 'surf1_ar', 'surf1_vol')
        under_exp_surface_activity_2 = etl.cut(under_exp_activity, 'mms_cid', 'surf2_ind', 'surf2_ct', 'surf2_ar', 'surf2_vol')
        under_exp_surface_activity_3 = etl.cut(under_exp_activity, 'mms_cid', 'surf3_ind', 'surf3_ct', 'surf3_ar', 'surf3_vol')
        under_exp_surface_activity_4 = etl.cut(under_exp_activity, 'mms_cid', 'surf4_ind', 'surf4_ct', 'surf4_ar', 'surf4_vol')
        under_exp_surface_activity_7 = etl.cut(under_exp_activity, 'mms_cid', 'surf7_ind', 'surf7_ct', 'surf7_ar', 'surf7_vol')
        under_exp_surface_activity_8 = etl.cut(under_exp_activity, 'mms_cid', 'surf8_ind', 'surf8_ct', 'surf8_ar', 'surf8_vol')
        under_exp_surface_activity_9 = etl.cut(under_exp_activity, 'mms_cid', 'surf9_ind', 'surf9_ct', 'surf9_ar', 'surf9_vol')
        under_exp_surface_activity_10 = etl.cut(under_exp_activity, 'mms_cid', 'surf10_ind', 'surf10_ct', 'surf10_ar', 'surf10_vol')

        under_exp_surface_activity_1 = etl.select(under_exp_surface_activity_1, lambda v: v['surf1_ind'] == 1)
        under_exp_surface_activity_2 = etl.select(under_exp_surface_activity_2, lambda v: v['surf2_ind'] == 1)
        under_exp_surface_activity_3 = etl.select(under_exp_surface_activity_3, lambda v: v['surf3_ind'] == 1)
        under_exp_surface_activity_4 = etl.select(under_exp_surface_activity_4, lambda v: v['surf4_ind'] == 1)
        under_exp_surface_activity_7 = etl.select(under_exp_surface_activity_7, lambda v: v['surf7_ind'] == 1)
        under_exp_surface_activity_8 = etl.select(under_exp_surface_activity_8, lambda v: v['surf8_ind'] == 1)
        under_exp_surface_activity_9 = etl.select(under_exp_surface_activity_9, lambda v: v['surf9_ind'] == 1)
        under_exp_surface_activity_10 = etl.select(under_exp_surface_activity_10, lambda v: v['surf10_ind'] == 1)
    
        under_exp_surface_activity_1 = etl.addfield(under_exp_surface_activity_1, 'type','Portals/Entries')
        under_exp_surface_activity_1 = etl.addfield(under_exp_surface_activity_1, 'quantity', lambda v: v['surf1_ct'])
        under_exp_surface_activity_1 = etl.addfield(under_exp_surface_activity_1, 'disturbedarea', lambda v: v['surf1_ar'])
        under_exp_surface_activity_1 = etl.addfield(under_exp_surface_activity_1, 'timbervolume', lambda v: v['surf1_vol'])

        under_exp_surface_activity_1 = etl.cutout(under_exp_surface_activity_1, 'surf1_ind', 'surf1_ct', 'surf1_ar', 'surf1_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_1)
    
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'type','Ore Dump')
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'quantity', lambda v: v['surf2_ct'])
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'disturbedarea', lambda v: v['surf2_ar'])
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'timbervolume', lambda v: v['surf2_vol'])

        under_exp_surface_activity_2 = etl.cutout(under_exp_surface_activity_2, 'surf2_ind', 'surf2_ct', 'surf2_ar', 'surf2_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_2)

        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'type','Waste Dump')
        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'quantity', lambda v: v['surf3_ct'])
        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'disturbedarea', lambda v: v['surf3_ar'])
        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'timbervolume', lambda v: v['surf3_vol'])

        under_exp_surface_activity_3 = etl.cutout(under_exp_surface_activity_3, 'surf3_ind', 'surf3_ct', 'surf3_ar', 'surf3_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_3)

        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'type','Soil/Overburden')
        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'quantity', lambda v: v['surf4_ct'])
        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'disturbedarea', lambda v: v['surf4_ar'])
        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'timbervolume', lambda v: v['surf4_vol'])

        under_exp_surface_activity_4 = etl.cutout(under_exp_surface_activity_4, 'surf4_ind', 'surf4_ct', 'surf4_ar', 'surf4_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_4)
    
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'type','Equipment Lay-down Area')
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'quantity', lambda v: v['surf7_ct'])
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'disturbedarea', lambda v: v['surf7_ar'])
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'timbervolume', lambda v: v['surf7_vol'])

        under_exp_surface_activity_7 = etl.cutout(under_exp_surface_activity_7, 'surf7_ind', 'surf7_ct', 'surf7_ar', 'surf7_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_7)

        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'type','Fuel Storage (for the mine)')
        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'quantity', lambda v: v['surf8_ct'])
        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'disturbedarea', lambda v: v['surf8_ar'])
        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'timbervolume', lambda v: v['surf8_vol'])

        under_exp_surface_activity_8 = etl.cutout(under_exp_surface_activity_8, 'surf8_ind', 'surf8_ct', 'surf8_ar', 'surf8_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_8)
    
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'type','Other')
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'quantity', lambda v: v['surf9_ct'])
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'disturbedarea', lambda v: v['surf9_ar'])
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'timbervolume', lambda v: v['surf9_vol'])

        under_exp_surface_activity_9 = etl.cutout(under_exp_surface_activity_9, 'surf9_ind', 'surf9_ct', 'surf9_ar', 'surf9_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_9)

        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'type','Shaft')
        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'quantity', lambda v: v['surf10_ct'])
        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'disturbedarea', lambda v: v['surf10_ar'])
        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'timbervolume', lambda v: v['surf10_vol'])

        under_exp_surface_activity_10 = etl.cutout(under_exp_surface_activity_10, 'surf10_ind', 'surf10_ct', 'surf10_ar', 'surf10_vol')

        under_exp_surface_activity_detail = etl.cat(under_exp_surface_activity_detail, under_exp_surface_activity_10)
        under_exp_surface_activity_detail = etl.leftjoin(message_ids, under_exp_surface_activity_detail, key='mms_cid')

        under_exp_new_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.under_exp_new_activity'
        )

        under_exp_new_activity_detail = etl.cutout(under_exp_new_activity_detail, 'messageid', 'id')

        under_exp_new_activity_1 = etl.cut(under_exp_activity, 'mms_cid', 'devn1_ind', 'devn1_ct')
        under_exp_new_activity_2 = etl.cut(under_exp_activity, 'mms_cid', 'devn2_ind', 'devn2_ct')
        under_exp_new_activity_3 = etl.cut(under_exp_activity, 'mms_cid', 'devn3_ind', 'devn3_ct')
        under_exp_new_activity_4 = etl.cut(under_exp_activity, 'mms_cid', 'devn4_ind', 'devn4_ct')
        under_exp_new_activity_5 = etl.cut(under_exp_activity, 'mms_cid', 'devn5_ind', 'devn5_ct')
        under_exp_new_activity_6 = etl.cut(under_exp_activity, 'mms_cid', 'devn6_ind', 'devn6_ct')
        under_exp_new_activity_7 = etl.cut(under_exp_activity, 'mms_cid', 'devn7_ind', 'devn7_ct')
        under_exp_new_activity_8 = etl.cut(under_exp_activity, 'mms_cid', 'devn8_ind', 'devn8_ct')

        under_exp_new_activity_1 = etl.select(under_exp_new_activity_1, lambda v: v['devn1_ind'] == 1)
        under_exp_new_activity_2 = etl.select(under_exp_new_activity_2, lambda v: v['devn2_ind'] == 1)
        under_exp_new_activity_3 = etl.select(under_exp_new_activity_3, lambda v: v['devn3_ind'] == 1)
        under_exp_new_activity_4 = etl.select(under_exp_new_activity_4, lambda v: v['devn4_ind'] == 1)
        under_exp_new_activity_5 = etl.select(under_exp_new_activity_5, lambda v: v['devn5_ind'] == 1)
        under_exp_new_activity_6 = etl.select(under_exp_new_activity_6, lambda v: v['devn6_ind'] == 1)
        under_exp_new_activity_7 = etl.select(under_exp_new_activity_7, lambda v: v['devn7_ind'] == 1)
        under_exp_new_activity_8 = etl.select(under_exp_new_activity_8, lambda v: v['devn8_ind'] == 1)
    
        under_exp_new_activity_1 = etl.addfield(under_exp_new_activity_1, 'type','Portals/Entries')
        under_exp_new_activity_1 = etl.addfield(under_exp_new_activity_1, 'quantity', lambda v: v['devn1_ct'])

        under_exp_new_activity_1 = etl.cutout(under_exp_new_activity_1, 'devn1_ind', 'devn1_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_1)
    
        under_exp_new_activity_2 = etl.addfield(under_exp_new_activity_2, 'type','Drifts')
        under_exp_new_activity_2 = etl.addfield(under_exp_new_activity_2, 'quantity', lambda v: v['devn2_ct'])

        under_exp_new_activity_2 = etl.cutout(under_exp_new_activity_2, 'devn2_ind', 'devn2_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_2)

        under_exp_new_activity_3 = etl.addfield(under_exp_new_activity_3, 'type','Raises')
        under_exp_new_activity_3 = etl.addfield(under_exp_new_activity_3, 'quantity', lambda v: v['devn3_ct'])

        under_exp_new_activity_3 = etl.cutout(under_exp_new_activity_3, 'devn3_ind', 'devn3_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_3)

        under_exp_new_activity_4 = etl.addfield(under_exp_new_activity_4, 'type','Ramps')
        under_exp_new_activity_4 = etl.addfield(under_exp_new_activity_4, 'quantity', lambda v: v['devn4_ct'])

        under_exp_new_activity_4 = etl.cutout(under_exp_new_activity_4, 'devn4_ind', 'devn4_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_4)

        under_exp_new_activity_5 = etl.addfield(under_exp_new_activity_5, 'type','Shafts')
        under_exp_new_activity_5 = etl.addfield(under_exp_new_activity_5, 'quantity', lambda v: v['devn5_ct'])

        under_exp_new_activity_5 = etl.cutout(under_exp_new_activity_5, 'devn5_ind', 'devn5_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_5)

        under_exp_new_activity_6 = etl.addfield(under_exp_new_activity_6, 'type','De-Pillar')
        under_exp_new_activity_6 = etl.addfield(under_exp_new_activity_6, 'quantity', lambda v: v['devn6_ct'])

        under_exp_new_activity_6 = etl.cutout(under_exp_new_activity_6, 'devn6_ind', 'devn6_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_6)

        under_exp_new_activity_7 = etl.addfield(under_exp_new_activity_7, 'type', 'Other')
        under_exp_new_activity_7 = etl.addfield(under_exp_new_activity_7, 'quantity', lambda v: v['devn7_ct'])

        under_exp_new_activity_7 = etl.cutout(under_exp_new_activity_7, 'devn7_ind', 'devn7_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_7)

        under_exp_new_activity_8 = etl.addfield(under_exp_new_activity_8, 'type','Stope')
        under_exp_new_activity_8 = etl.addfield(under_exp_new_activity_8, 'quantity', lambda v: v['devn8_ct'])

        under_exp_new_activity_8 = etl.cutout(under_exp_new_activity_8, 'devn8_ind', 'devn8_ct')

        under_exp_new_activity_detail = etl.cat(under_exp_new_activity_detail, under_exp_new_activity_8)
        under_exp_new_activity_detail = etl.leftjoin(message_ids, under_exp_new_activity_detail, key='mms_cid')

        under_exp_rehab_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.under_exp_rehab_activity'
        )

        under_exp_rehab_activity_detail = etl.cutout(under_exp_rehab_activity_detail, 'messageid', 'id')

        under_exp_rehab_activity_1 = etl.cut(under_exp_activity, 'mms_cid', 'devr1_ind', 'devr1_ct')
        under_exp_rehab_activity_2 = etl.cut(under_exp_activity, 'mms_cid', 'devr2_ind', 'devr2_ct')
        under_exp_rehab_activity_3 = etl.cut(under_exp_activity, 'mms_cid', 'devr3_ind', 'devr3_ct')
        under_exp_rehab_activity_4 = etl.cut(under_exp_activity, 'mms_cid', 'devr4_ind', 'devr4_ct')
        under_exp_rehab_activity_5 = etl.cut(under_exp_activity, 'mms_cid', 'devr5_ind', 'devr5_ct')
        under_exp_rehab_activity_6 = etl.cut(under_exp_activity, 'mms_cid', 'devr6_ind', 'devr6_ct')
        under_exp_rehab_activity_7 = etl.cut(under_exp_activity, 'mms_cid', 'devr7_ind', 'devr7_ct')
        under_exp_rehab_activity_8 = etl.cut(under_exp_activity, 'mms_cid', 'devr8_ind', 'devr8_ct')

        under_exp_rehab_activity_1 = etl.select(under_exp_rehab_activity_1, lambda v: v['devr1_ind'] == 1)
        under_exp_rehab_activity_2 = etl.select(under_exp_rehab_activity_2, lambda v: v['devr2_ind'] == 1)
        under_exp_rehab_activity_3 = etl.select(under_exp_rehab_activity_3, lambda v: v['devr3_ind'] == 1)
        under_exp_rehab_activity_4 = etl.select(under_exp_rehab_activity_4, lambda v: v['devr4_ind'] == 1)
        under_exp_rehab_activity_5 = etl.select(under_exp_rehab_activity_5, lambda v: v['devr5_ind'] == 1)
        under_exp_rehab_activity_6 = etl.select(under_exp_rehab_activity_6, lambda v: v['devr6_ind'] == 1)
        under_exp_rehab_activity_7 = etl.select(under_exp_rehab_activity_7, lambda v: v['devr7_ind'] == 1)
        under_exp_rehab_activity_8 = etl.select(under_exp_rehab_activity_8, lambda v: v['devr8_ind'] == 1)
    
        under_exp_rehab_activity_1 = etl.addfield(under_exp_rehab_activity_1, 'type','Portals/Entries')
        under_exp_rehab_activity_1 = etl.addfield(under_exp_rehab_activity_1, 'quantity', lambda v: v['devr1_ct'])

        under_exp_rehab_activity_1 = etl.cutout(under_exp_rehab_activity_1, 'devr1_ind', 'devr1_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_1)
    
        under_exp_rehab_activity_2 = etl.addfield(under_exp_rehab_activity_2, 'type','Drifts')
        under_exp_rehab_activity_2 = etl.addfield(under_exp_rehab_activity_2, 'quantity', lambda v: v['devr2_ct'])

        under_exp_rehab_activity_2 = etl.cutout(under_exp_rehab_activity_2, 'devr2_ind', 'devr2_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_2)

        under_exp_rehab_activity_3 = etl.addfield(under_exp_rehab_activity_3, 'type','Raises')
        under_exp_rehab_activity_3 = etl.addfield(under_exp_rehab_activity_3, 'quantity', lambda v: v['devr3_ct'])

        under_exp_rehab_activity_3 = etl.cutout(under_exp_rehab_activity_3, 'devr3_ind', 'devr3_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_3)

        under_exp_rehab_activity_4 = etl.addfield(under_exp_rehab_activity_4, 'type','Ramps')
        under_exp_rehab_activity_4 = etl.addfield(under_exp_rehab_activity_4, 'quantity', lambda v: v['devr4_ct'])

        under_exp_rehab_activity_4 = etl.cutout(under_exp_rehab_activity_4, 'devr4_ind', 'devr4_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_4)

        under_exp_rehab_activity_5 = etl.addfield(under_exp_rehab_activity_5, 'type','Shafts')
        under_exp_rehab_activity_5 = etl.addfield(under_exp_rehab_activity_5, 'quantity', lambda v: v['devr5_ct'])

        under_exp_rehab_activity_5 = etl.cutout(under_exp_rehab_activity_5, 'devr5_ind', 'devr5_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_5)

        under_exp_rehab_activity_6 = etl.addfield(under_exp_rehab_activity_6, 'type','De-Pillar')
        under_exp_rehab_activity_6 = etl.addfield(under_exp_rehab_activity_6, 'quantity', lambda v: v['devr6_ct'])

        under_exp_rehab_activity_6 = etl.cutout(under_exp_rehab_activity_6, 'devr6_ind', 'devr6_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_6)

        under_exp_rehab_activity_7 = etl.addfield(under_exp_rehab_activity_7, 'type', 'Other')
        under_exp_rehab_activity_7 = etl.addfield(under_exp_rehab_activity_7, 'quantity', lambda v: v['devr7_ct'])

        under_exp_rehab_activity_7 = etl.cutout(under_exp_rehab_activity_7, 'devr7_ind', 'devr7_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_7)

        under_exp_rehab_activity_8 = etl.addfield(under_exp_rehab_activity_8, 'type','Stope')
        under_exp_rehab_activity_8 = etl.addfield(under_exp_rehab_activity_8, 'quantity', lambda v: v['devr8_ct'])

        under_exp_rehab_activity_8 = etl.cutout(under_exp_rehab_activity_8, 'devr8_ind', 'devr8_ct')

        under_exp_rehab_activity_detail = etl.cat(under_exp_rehab_activity_detail, under_exp_rehab_activity_8)

        under_exp_rehab_activity_detail = etl.leftjoin(message_ids, under_exp_rehab_activity_detail, key='mms_cid')
        applications = etl.leftjoin(applications, under_exp_activity_app_cols, key='mms_cid')

        camps = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, act1_ar as campdisturbedarea, act1_vol as camptimbervolume, act2_ar as bldgdisturbedarea, act2_vol as bldgtimbervolume, act3_ar as stgedisturbedarea, act3_vol as stgetimbervolume, recl_desc as cbsfreclamation, recl_dol as cbsfreclamationcost from mms.mmssca_n'
        )

        applications = etl.leftjoin(applications, camps, key='mms_cid')

        timber_cutting = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, tot_bol as timbertotalvolume, fup_ind as freeusepermit, ltc_ind as licencetocut from mms.mmssck_n'
        )

        applications = etl.leftjoin(applications, timber_cutting, key='mms_cid')

        explosive_permits = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, perm_ind, perm_no as bcexplosivespermitnumber, expry_dt as bcexplosivespermitexpiry from mms.mmsscc_n'
        )

        explosive_permits = etl.addfield(explosive_permits, 'bcexplosivespermitissued', lambda v: 'Yes' if v['perm_ind'] == 1 else 'No')
        explosive_permits = etl.cutout(explosive_permits, 'perm_ind')

        applications = etl.leftjoin(applications, explosive_permits, key='mms_cid')

        #Existing Placer------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        placer_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as placerreclamation, recl_dol as placerreclamationcost, edist_ar as placertotalexistdistarea, pdist_ar as placerdisturbedarea, t_vol as placertimbervolume, edist1_ind, edist2_ind, edist3_ind, edist4_ind, edist5_ind, edist6_ind, edist7_ind, edist8_ind, edist1_cnt, edist2_cnt, edist3_cnt, edist4_cnt, edist5_cnt, edist6_cnt, edist7_cnt, edist8_cnt, edist1_ar, edist2_ar, edist3_ar, edist4_ar, edist5_ar, edist6_ar, edist7_ar, edist8_ar, pdist2_ind, pdist3_ind, pdist4_ind, pdist8_ind, pdist9_ind, pdist2_cnt, pdist3_cnt, pdist4_cnt, pdist8_cnt, pdist9_cnt, pdist2_ar, pdist3_ar, pdist9_ar, pdist4_ar, pdist8_ar from mms.mmssch_n'
        )

        placer_activity_app_cols = etl.cut(placer_activity, 'mms_cid', 'placerreclamation', 'placerreclamationcost', 'placertotalexistdistarea', 'placerdisturbedarea', 'placertimbervolume')

        placer_activity = etl.cutout(placer_activity, 'placerreclamation', 'placerreclamationcost', 'placertotalexistdistarea', 'placerdisturbedarea', 'placertimbervolume')

        existing_placer_activity = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.placer_activity')

        existing_placer_activity = etl.cutout(existing_placer_activity, 'messageid', 'placeractivityid')

        proposed_placer_activity = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.placer_activity')
        
        proposed_placer_activity = etl.cutout(proposed_placer_activity, 'messageid', 'placeractivityid')
        
        existing_placer_activity_1 = etl.cut(placer_activity, 'mms_cid', 'edist1_ind', 'edist1_cnt', 'edist1_ar')
        existing_placer_activity_2 = etl.cut(placer_activity, 'mms_cid', 'edist2_ind', 'edist2_cnt', 'edist2_ar')
        existing_placer_activity_3 = etl.cut(placer_activity, 'mms_cid', 'edist3_ind', 'edist3_cnt', 'edist3_ar')
        existing_placer_activity_4 = etl.cut(placer_activity, 'mms_cid', 'edist4_ind', 'edist4_cnt', 'edist4_ar')
        existing_placer_activity_5 = etl.cut(placer_activity, 'mms_cid', 'edist5_ind', 'edist5_cnt', 'edist5_ar')
        existing_placer_activity_6 = etl.cut(placer_activity, 'mms_cid', 'edist6_ind', 'edist6_cnt', 'edist6_ar')
        existing_placer_activity_7 = etl.cut(placer_activity, 'mms_cid', 'edist7_ind', 'edist7_cnt', 'edist7_ar')
        existing_placer_activity_8 = etl.cut(placer_activity, 'mms_cid', 'edist8_ind', 'edist8_cnt', 'edist8_ar')

        existing_placer_activity_1 = etl.select(existing_placer_activity_1, lambda v: v['edist1_ind'] == 1)
        existing_placer_activity_2 = etl.select(existing_placer_activity_2, lambda v: v['edist2_ind'] == 1)
        existing_placer_activity_3 = etl.select(existing_placer_activity_3, lambda v: v['edist3_ind'] == 1)
        existing_placer_activity_4 = etl.select(existing_placer_activity_4, lambda v: v['edist4_ind'] == 1)
        existing_placer_activity_5 = etl.select(existing_placer_activity_5, lambda v: v['edist5_ind'] == 1)
        existing_placer_activity_6 = etl.select(existing_placer_activity_6, lambda v: v['edist6_ind'] == 1)
        existing_placer_activity_7 = etl.select(existing_placer_activity_7, lambda v: v['edist7_ind'] == 1)
        existing_placer_activity_8 = etl.select(existing_placer_activity_8, lambda v: v['edist8_ind'] == 1)


        existing_placer_activity_1 = etl.addfield(existing_placer_activity_1, 'type','Settling Ponds')
        # existing_placer_activity_1 = etl.addrownumbers(existing_placer_activity_1, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_1 = etl.addfield(existing_placer_activity_1, 'quantity', lambda v: v['edist1_cnt'])
        existing_placer_activity_1 = etl.addfield(existing_placer_activity_1, 'disturbedarea', lambda v: v['edist1_ar'])

        existing_placer_activity_1 = etl.cutout(existing_placer_activity_1, 'edist1_ind', 'edist1_cnt', 'edist1_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_1)


        existing_placer_activity_2 = etl.addfield(existing_placer_activity_2, 'type','Mining Areas')
        # existing_placer_activity_2 = etl.addfield(existing_placer_activity_2, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_2 = etl.addfield(existing_placer_activity_2, 'quantity', lambda v: v['edist2_cnt'])
        existing_placer_activity_2 = etl.addfield(existing_placer_activity_2, 'disturbedarea', lambda v: v['edist2_ar'])

        existing_placer_activity_2 = etl.cutout(existing_placer_activity_2, 'edist2_ind', 'edist2_cnt', 'edist2_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_2)


        existing_placer_activity_3 = etl.addfield(existing_placer_activity_3, 'type','Coarse Tailings Piles & Wash Plants')
        # existing_placer_activity_3 = etl.addfield(existing_placer_activity_3, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_3 = etl.addfield(existing_placer_activity_3, 'quantity', lambda v: v['edist3_cnt'])
        existing_placer_activity_3 = etl.addfield(existing_placer_activity_3, 'disturbedarea', lambda v: v['edist3_ar'])

        existing_placer_activity_3 = etl.cutout(existing_placer_activity_3, 'edist3_ind', 'edist3_cnt', 'edist3_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_3)


        existing_placer_activity_4 = etl.addfield(existing_placer_activity_4, 'type','Existing Access')
        # existing_placer_activity_4 = etl.addfield(existing_placer_activity_4, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_4 = etl.addfield(existing_placer_activity_4, 'quantity', lambda v: v['edist4_cnt'])
        existing_placer_activity_4 = etl.addfield(existing_placer_activity_4, 'disturbedarea', lambda v: v['edist4_ar'])

        existing_placer_activity_4 = etl.cutout(existing_placer_activity_4, 'edist4_ind', 'edist4_cnt', 'edist4_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_4)


        existing_placer_activity_5 = etl.addfield(existing_placer_activity_5, 'type','Trenching')
        # existing_placer_activity_5 = etl.addfield(existing_placer_activity_5, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_5 = etl.addfield(existing_placer_activity_5, 'quantity', lambda v: v['edist5_cnt'])
        existing_placer_activity_5 = etl.addfield(existing_placer_activity_5, 'disturbedarea', lambda v: v['edist5_ar'])

        existing_placer_activity_5 = etl.cutout(existing_placer_activity_5, 'edist5_ind', 'edist5_cnt', 'edist5_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_5)


        existing_placer_activity_6 = etl.addfield(existing_placer_activity_6, 'type','Test Pits')
        # existing_placer_activity_6 = etl.addfield(existing_placer_activity_6, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_6 = etl.addfield(existing_placer_activity_6, 'quantity', lambda v: v['edist6_cnt'])
        existing_placer_activity_6 = etl.addfield(existing_placer_activity_6, 'disturbedarea', lambda v: v['edist6_ar'])

        existing_placer_activity_6 = etl.cutout(existing_placer_activity_6, 'edist6_ind', 'edist6_cnt', 'edist6_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_6)


        existing_placer_activity_7 = etl.addfield(existing_placer_activity_7, 'type','Campsite')
        # existing_placer_activity_7 = etl.addfield(existing_placer_activity_7, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_7 = etl.addfield(existing_placer_activity_7, 'quantity', lambda v: v['edist7_cnt'])
        existing_placer_activity_7 = etl.addfield(existing_placer_activity_7, 'disturbedarea', lambda v: v['edist7_ar'])

        existing_placer_activity_7 = etl.cutout(existing_placer_activity_7, 'edist7_ind', 'edist7_cnt', 'edist7_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_7)


        existing_placer_activity_8 = etl.addfield(existing_placer_activity_8, 'type','Other')
        # existing_placer_activity_8 = etl.addfield(existing_placer_activity_8, 'placeractivityid', next(placer_activity_id))
        existing_placer_activity_8 = etl.addfield(existing_placer_activity_8, 'quantity', lambda v: v['edist8_cnt'])
        existing_placer_activity_8 = etl.addfield(existing_placer_activity_8, 'disturbedarea', lambda v: v['edist8_ar'])

        existing_placer_activity_8 = etl.cutout(existing_placer_activity_8, 'edist8_ind', 'edist8_cnt', 'edist8_ar')

        existing_placer_activity = etl.cat(existing_placer_activity, existing_placer_activity_8)

        existing_placer_activity = etl.addfield(existing_placer_activity, 'identifier', 'existing')

        #Proposed Placer------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        proposed_placer_activity_2 = etl.cut(placer_activity, 'mms_cid', 'pdist2_ind', 'pdist2_cnt', 'pdist2_ar')
        proposed_placer_activity_3 = etl.cut(placer_activity, 'mms_cid', 'pdist3_ind', 'pdist3_cnt', 'pdist3_ar')
        proposed_placer_activity_4 = etl.cut(placer_activity, 'mms_cid', 'pdist4_ind', 'pdist4_cnt', 'pdist4_ar')
        proposed_placer_activity_8 = etl.cut(placer_activity, 'mms_cid', 'pdist8_ind', 'pdist8_cnt', 'pdist8_ar')
        proposed_placer_activity_9 = etl.cut(placer_activity, 'mms_cid', 'pdist9_ind', 'pdist9_cnt', 'pdist9_ar')

        proposed_placer_activity_2 = etl.select(proposed_placer_activity_2, lambda v: v['pdist2_ind'] == 1)
        proposed_placer_activity_3 = etl.select(proposed_placer_activity_3, lambda v: v['pdist3_ind'] == 1)
        proposed_placer_activity_4 = etl.select(proposed_placer_activity_4, lambda v: v['pdist4_ind'] == 1)
        proposed_placer_activity_8 = etl.select(proposed_placer_activity_8, lambda v: v['pdist8_ind'] == 1)
        proposed_placer_activity_9 = etl.select(proposed_placer_activity_9, lambda v: v['pdist9_ind'] == 1)

        proposed_placer_activity_2 = etl.addfield(proposed_placer_activity_2, 'type','Mining Areas')
        # proposed_placer_activity_2 = etl.addfield(proposed_placer_activity_2, 'placeractivityid', next(placer_activity_id))
        proposed_placer_activity_2 = etl.addfield(proposed_placer_activity_2, 'quantity', lambda v: v['pdist2_cnt'])
        proposed_placer_activity_2 = etl.addfield(proposed_placer_activity_2, 'disturbedarea', lambda v: v['pdist2_ar'])

        proposed_placer_activity_2 = etl.cutout(proposed_placer_activity_2, 'pdist2_ind', 'pdist2_cnt', 'pdist2_ar')

        proposed_placer_activity = etl.cat(proposed_placer_activity, proposed_placer_activity_2)


        proposed_placer_activity_3 = etl.addfield(proposed_placer_activity_3, 'type','Coarse Tailings Piles & Wash Plants')
        # proposed_placer_activity_3 = etl.addfield(proposed_placer_activity_3, 'placeractivityid', next(placer_activity_id))
        proposed_placer_activity_3 = etl.addfield(proposed_placer_activity_3, 'quantity', lambda v: v['pdist3_cnt'])
        proposed_placer_activity_3 = etl.addfield(proposed_placer_activity_3, 'disturbedarea', lambda v: v['pdist3_ar'])

        proposed_placer_activity_3 = etl.cutout(proposed_placer_activity_3, 'pdist3_ind', 'pdist3_cnt', 'pdist3_ar')

        proposed_placer_activity = etl.cat(proposed_placer_activity, proposed_placer_activity_3)


        proposed_placer_activity_4 = etl.addfield(proposed_placer_activity_4, 'type','Existing Access')
        # proposed_placer_activity_4 = etl.addfield(proposed_placer_activity_4, 'placeractivityid', next(placer_activity_id))
        proposed_placer_activity_4 = etl.addfield(proposed_placer_activity_4, 'quantity', lambda v: v['pdist4_cnt'])
        proposed_placer_activity_4 = etl.addfield(proposed_placer_activity_4, 'disturbedarea', lambda v: v['pdist4_ar'])

        proposed_placer_activity_4 = etl.cutout(proposed_placer_activity_4, 'pdist4_ind', 'pdist4_cnt', 'pdist4_ar')

        proposed_placer_activity = etl.cat(proposed_placer_activity, proposed_placer_activity_4)


        proposed_placer_activity_8 = etl.addfield(proposed_placer_activity_8, 'type','Other')
        # proposed_placer_activity_8 = etl.addfield(proposed_placer_activity_8, 'placeractivityid', next(placer_activity_id))
        proposed_placer_activity_8 = etl.addfield(proposed_placer_activity_8, 'quantity', lambda v: v['pdist8_cnt'])
        proposed_placer_activity_8 = etl.addfield(proposed_placer_activity_8, 'disturbedarea', lambda v: v['pdist8_ar'])

        proposed_placer_activity_8 = etl.cutout(proposed_placer_activity_8, 'pdist8_ind', 'pdist8_cnt', 'pdist8_ar')

        proposed_placer_activity = etl.cat(proposed_placer_activity, proposed_placer_activity_8)

        proposed_placer_activity_9 = etl.addfield(proposed_placer_activity_9, 'type','Enhanced Sniping')
        # proposed_placer_activity_9 = etl.addfield(proposed_placer_activity_9, 'placeractivityid', next(placer_activity_id))
        proposed_placer_activity_9 = etl.addfield(proposed_placer_activity_9, 'quantity', lambda v: v['pdist9_cnt'])
        proposed_placer_activity_9 = etl.addfield(proposed_placer_activity_9, 'disturbedarea', lambda v: v['pdist9_ar'])

        proposed_placer_activity_9 = etl.cutout(proposed_placer_activity_9, 'pdist9_ind', 'pdist9_cnt', 'pdist9_ar')

        proposed_placer_activity = etl.cat(proposed_placer_activity, proposed_placer_activity_9)

        proposed_placer_activity = etl.addfield(proposed_placer_activity, 'identifier', 'proposed')

        placer_activity = etl.cat(proposed_placer_activity, existing_placer_activity)

        placer_activity = etl.addrownumbers(placer_activity)

        placer_activity = etl.rename(placer_activity, 'row', 'placeractivityid')

        proposed_placer_activity_xref = etl.select(placer_activity, lambda v: v['identifier'] == 'proposed')

        existing_placer_activity_xref = etl.select(placer_activity, lambda v: v['identifier'] == 'existing')

        proposed_placer_activity_xref = etl.cut(proposed_placer_activity_xref, 'placeractivityid', 'mms_cid')

        existing_placer_activity_xref = etl.cut(existing_placer_activity_xref, 'placeractivityid', 'mms_cid')

        placer_activity = etl.cutout(placer_activity, 'identifier')

        applications = etl.leftjoin(applications, placer_activity_app_cols, key='mms_cid')

        #Contacts----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        contacts = etl.fromdb(connection, 'SELECT cid as mms_cid, mine_no, name, l_name, phone, tel_ext, fax, email, street, city, prov, post_cd, entered_by from mms.mmsscc_n')

        contact_type = etl.fromdb(connection, 'SELECT cid as mms_cid, cid_ccn, type_ind from mms.mmsccc')

        contacts = etl.join(contacts, contact_type, key='mms_cid')

        clients = etl.select(contacts, lambda v: v['type_ind'] == 'NNNNNY')

        # contacts = etl.select(contacts, )

        #Streamline NoW----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        # This is temporarily removed due to the data in the streamline NoW table in MMS being bad and unable to be imported.

        # streamline_application = etl.fromdb(
        #     connection,
        #     f'SELECT cid as mms_cid, recv_dt as receiveddate, pmt_typ, comm_desc, exp_desc as descexplorationprogram, ten_nos1, ten_nos2, cg_clms1, cg_clms2, legal_desc1, legal_desc2, priv_ind, water_ind, culture_ind, fuel_ind, ltr_amt as fuellubstored, barrel_ind, bulk_ind from mms.mmsstream_now'
        # )

        # streamline_application = etl.addfield(
        #     streamline_application, 'typeofapplication',
        #     lambda v: 'New Permit' if v['pmt_typ'] == 'N' else 'Amendment')

        # streamline_application = etl.addfield(
        #     streamline_application, 'firstaidequipmentonsite',
        #     lambda v: v['comm_desc'].split('  ')[0] if (v['comm_desc'] != '' or v['comm_desc'] is not None) else None)
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'firstaidcertlevel',
        #     lambda v: v['comm_desc'].split('  ')[1] if (v['comm_desc'] != '' or v['comm_desc'] is not None) else None)
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'tenurenumbers',
        #     lambda v: v['ten_nos1'] + v['ten_nos2'])
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'crowngrantlotnumbers',
        #     lambda v: v['cg_clms1'] + v['cg_clms2'])
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'landlegaldesc',
        #     lambda v: v['legal_desc1'] + v['legal_desc2'])
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'landprivate',
        #     lambda v: 'Yes' if v['priv_ind'] == 1 else 'No')
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'landcommunitywatershed',
        #     lambda v: 'Yes' if v['water_ind'] == 1 else 'No')
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'archsitesaffected',
        #     lambda v: 'Yes' if v['culture_ind'] == 1 else 'No')
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'fuellubstoreonsite',
        #     lambda v: 'Yes' if v['fuel_ind'] == 1 else 'No')
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'fuellubstoremethodbarrel',
        #     lambda v: 'Yes' if v['barrel_ind'] == 1 else 'No')
        
        # streamline_application = etl.addfield(
        #     streamline_application, 'fuellubstoremethodbulk',
        #     lambda v: 'Yes' if v['bulk_ind'] == 1 else 'No')
        
        # streamline_application = etl.cutout(streamline_application, 'comm_desc', 'pmt_typ', 'ten_nos1', 'ten_nos2', 'cg_clms1', 'cg_clms2', 'legal_desc1', 'legal_desc2', 'priv_ind', 'water_ind', 'culture_ind', 'fuel_ind', 'barrel_ind', 'bulk_ind')
        
        # streamline_application = etl.cut(streamline_application, 'mms_cid', 'startworkdate', 'endworkdate')
        # streamline_application = etl.leftjoin(message_ids, streamline_application, key='mms_cid')

        water_source_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, water_nm as sourcewatersupply, activity as type, water_use as useofwater, water_vol as estimateratewater, pump_size as pumpsizeinwater, water_intake as locationwaterintake from mms.mmsscp_n_d'
        )

        water_source_activity = etl.leftjoin(message_ids, water_source_activity, key='mms_cid')

        application_nda = etl.fromdb(
            connection,
            f'SELECT messageid, trackingnumber, applicationtype, status, submitteddate, receiveddate, applicantclientid, submitterclientid, typedeemedauthorization, permitnumber, minenumber, nownumber, planactivitiesdrillprogram, planactivitiesipsurvey, proposedstartdate, proposedenddate, totallinekilometers, descplannedactivities, proposednewenddate, reasonforextension, anyotherinformation, vfcbcapplicationurl from mms.mmsnda'
        )
        
        settling_ponds = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, edist_ar as settlingpondtotalexistdistarea, pdist_ar as settlingponddisturbedarea, pdist_vol as settlingpondtimbervolume, water1_ind, water2_ind, water3_ind, recl_desc as pondsreclamation, recl_dol as pondsreclamationcost from mms.mmsscj_n'
        )

        settling_ponds = etl.addfield(
            settling_ponds, 'pondsrecycled',
            lambda v: 'Yes' if v['water1_ind'] == 1 else 'No')

        settling_ponds = etl.addfield(
            settling_ponds, 'pondsexfiltratedtoground',
            lambda v: 'Yes' if v['water2_ind'] == 1 else 'No')

        settling_ponds = etl.addfield(
            settling_ponds, 'pondsdischargedtoenv',
            lambda v: 'Yes' if v['water3_ind'] == 1 else 'No')

        settling_ponds = etl.cutout(settling_ponds, 'water1_ind', 'water2_ind', 'water3_ind')

        applications = etl.leftjoin(applications, settling_ponds, key='mms_cid')

        etl.appenddb(applications, connection, 'application', schema='mms_now_submissions', commit=False)
        etl.appenddb(water_source_activity, connection, 'water_source_activity', schema='mms_now_submissions', commit=False)
        # etl.appenddb(streamline_application, connection, 'application_start_stop', schema='mms_now_submissions', commit=False)
        etl.appenddb(sand_grv_qry_activity_detail, connection, 'sand_grv_qry_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(surface_bulk_activity_detail, connection, 'surface_bulk_sample_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(exploration_access_activity_detail, connection, 'exp_access_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(mech_trenching_activity_detail, connection, 'mech_trenching_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(under_exp_rehab_activity_detail, connection, 'under_exp_rehab_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(under_exp_surface_activity_detail, connection, 'under_exp_surface_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(under_exp_new_activity_detail, connection, 'under_exp_new_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(application_nda, connection, 'application_nda', schema='mms_now_submissions', commit=False)
        etl.appenddb(placer_activity, connection, 'placer_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(proposed_placer_activity_xref, connection, 'proposed_placer_activity_xref', schema='mms_now_submissions', commit=False)
        etl.appenddb(existing_placer_activity_xref, connection, 'existing_placer_activity_xref', schema='mms_now_submissions', commit=False)

    except Exception as err:
        print(f'ETL Parsing error: {err}')
        raise


def mms_now_submissions_ETL(connection):
    with connection:
        # Removing the data imported from the previous run.
        print('Truncating existing tables...')
        truncate_table(connection, TABLES)

        # Importing the vFCBC NoW submission data.
        print('Beginning MMS NoW ETL:')
        ETL_MMS_NOW_schema(connection, TABLES)
