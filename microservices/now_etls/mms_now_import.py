import psycopg2
import uuid
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta

TABLES = [
    'application',
    'application_nda',
    'contact',
    'existing_placer_activity_xref',
    'existing_settling_pond_xref',
    'exp_access_activity',
    'exp_surface_drill_activity',
    'mech_trenching_activity',
    'placer_activity',
    'proposed_placer_activity_xref',
    'proposed_settling_pond_xref',
    'sand_grv_qry_activity',
    'settling_pond',
    'surface_bulk_sample_activity',
    'under_exp_new_activity',
    'under_exp_rehab_activity',
    'under_exp_surface_activity',
    'water_source_activity',
    'application_start_stop',
]


def truncate_table(connection, tables):
    cursor = connection.cursor()
    for table in tables:
        print(f'Truncating {table}...')
        cursor.execute(f'TRUNCATE TABLE mms_now_submissions.{table} CONTINUE IDENTITY CASCADE;')


def join_mine_guids(connection, application_table):
    current_mines = etl.fromdb(
        connection,
        'select distinct on (minenumber) mine_guid, mine_no as minenumber from public.mine order by minenumber, create_timestamp;'
    )
    application_table_guid_lookup = etl.leftjoin(application_table, current_mines, key='minenumber')
    return application_table_guid_lookup


def ETL_MMS_NOW_schema(connection, tables):
    '''Import all the data from the specified schema and tables.'''
    try:
        applications = etl.fromdb(
            connection,
            f'SELECT msg_id as messageid, cid as mms_cid, mine_no as minenumber, apl_dt as submitteddate, lat_dec as latitude, lon_dec as longitude, multi_year_ind, multi_year_area_ind, str_Dt as ProposedStartDate, end_dt as ProposedEndDate, site_desc as SiteDirections, prpty_nm as NameOfProperty, apl_typ from mms.mmsnow'
        )

        applications = etl.addfield(
            applications, 'NoticeOfWorkType',
            lambda v: 'Mineral' if v['apl_typ'] == 'M' else ('Placer Operations' if v['apl_typ'] == 'P' else 'Sand & Gravel')
        )

        applications = etl.cutout(applications, 'apl_typ')

        message_ids = etl.cut(applications, 'mms_cid', 'messageid')

        applications = etl.addfield(
            applications, 'typeofpermit',
            lambda v: 'I would like to apply for a Multi-Year, Area Based permit' if v['multi_year_area_ind'] == 1 else ('I would like to apply for a Multi-Year permit' if v['multi_year_ind'] == 1 else None)
        )
        applications = etl.cutout(applications, 'multi_year_area_ind')
        applications = etl.cutout(applications, 'multi_year_ind')

        sand_grv_qry_activity = etl.fromdb(
            connection,
            "SELECT cid as mms_cid, recl_desc as sandgrvqryreclamation, recl_dol as sandgrvqryreclamationcost, backslope as sandgrvqryreclamationbackfill, oper1_ind, oper2_ind, oper3_ind, alr_ind as SANDGRVQRYWITHINAGLANDRES, srb_ind as sandgrvqrylocalgovsoilrembylaw, pdist_ar as SANDGRVQRYDISTURBEDAREA, t_vol as SANDGRVQRYTIMBERVOLUME, edist_Ar as SANDGRVQRYTOTALEXISTDISTAREA, act1_ind, act2_ind, act3_ind, act4_ind, act1_ar, act2_ar, act3_ar, act4_ar, act1_vol, act2_vol, act3_vol, act4_vol from mms.mmssci_n where cid not in ('1610619201301', '1610619201301', '1610619201301', '1610619201301', '1641179201301', '1641180201301', '0900204199901', '1500363201301', '0101302201301', '1650080201302', '1200007201301', '1640974201301', '1101939201301', '0101702201901', '1630649201301', '0900127201301', '1641174201301', '1630124201301', '1620269201301', '1641128201301', '1650234201301', '1630742201501', '1101692201702', '0900221201501', '0101525201501', '0900168201501', '0900168201502', '0900204201701', '1641474201701', '1641366201601', '1620702201601', '1630215201701', '0101228201601', '1620574201601', '1641330201602', '1620818201701', '0200279201701', '1641971201701', '1650885201601', '1631026201701', '0101046201601', '0900133201701', '1641254201402', '1641200201701', '1621397201401', '1650395201601', '0900102201401', '0800688201601', '0400625201501', '0900063201702', '1640993201701', '0900220201501', '0900217201501', '0101046201401', '1620010201501', '1641329201601', '0400426201701', '0900133201702', '1621438201501', '1642069201901', '0500368201501', '1641330201601', '1630513201601', '1640772201601', '1101246201501', '1641430201601', '0900204201703', '0900016201701', '1630734201501', '0101327201401', '1610675201501', '1650528201501', '0900204201702', '1641476201701', '1641013201402', '1620494201401', '1650617201701', '0900168201701', '1630539201701', '0900063201701', '1000409201601', '1640150201601', '1641384201601', '0800407201602', '1641119201401', '1650861201401', '1640847201601', '1620498201701', '0800612201701', '1641179201601', '0900163201601', '0501122201602', '1101692201701', '1630080201701', '0603333201701', '0200279201401', '0900223201501', '0700568201701', '0500297201701', '1640851201701', '1101122201401', '1641354201501', '1650611201501', '0400724201502', '1641281201401', '0500910201401', '0101050201501', '0900168201601', '0600402201601', '0900127201401', '0101684201401', '1630484201601', '1650080201401', '1650294201401', '1650816201301', '1641252201401', '0900222201501', '1650832201401', '1650892201501', '1641311201501', '0101228201501', '1620501201501', '1630292201501', '1630419201401', '1620335201402', '0900218201501', '1641256201501', '1640870201401', '0400724201501', '1650898201501', '1650902201501', '0101058201801', '1640983201701', '1640863201701', '0101098201901', '0400704201801', '1650615201901', '0101231201901', '1641200201901', '1640850201701', '1610376201801', '1630712201701', '0400056201703', '0900197201902', '1641200201902', '1631059201901', '0101703201901', '1621123201901', '1621636201701', '0800029201701', '0200381201901', '1500530201701', '1642042201801', '0101058201901', '1650617201901', '0900145201701', '1650087201901', '1650294201901', '1610632201901', '1640982201701', '1620381201801', '1650753201901', '1650563201901', '1631030201801', '0700541201801', '1640235201802', '1620291201701', '1630272201701', '1631056201701', '1641424201801', '0400625201901', '1650616201901', '1641060201701', '1621123201801', '1101529201801', '1620530201801', '1630646201901', '1640943201801', '0501178201701', '0400851201801', '1620381201802', '1641250201701', '1620332201801', '1640892201901', '1620269201801', '1640560201701', '1640982201901', '1642066201901', '0800695201901', '1650808201901', '1640857201801', '0900102201901', '1200007201801', '0200505201801', '1620322201801', '1650981201801', '1650982201801', '1641134201701', '0300512201801', '0400667201801', '1650832201901', '0101719201901', '0100789201901', '0500444201901', '0800106201901', '0600234201901', '0501258201801', '1640377201901', '0500147201901', '1610729201801', '1610393201801', '1641060201901', '1620291201801', '0800547201901', '1101122201901', '1500446201901', '1640850201901', '1641134201901', '1641170201901', '1640851201901', '0900102201902', '1000409201901', '0500122201901', '0500452201901', '1630708201801', '1640857201901', '1101122201902', '1640993201901', '1631042201801', '1640214201901', '1620335201701', '0300597201801', '0400056201801', '1641474201702', '1640677201901', '1620269201802', '1641182201901', '1610679201801', '0501178201901', '1610679201702', '1640892201701', '0101684201701', '1610724201801', '1642051201901', '1642051201901') limit 10"
        )

        sand_grv_qry_activity_app_cols = etl.cut(sand_grv_qry_activity, 
            'mms_cid', 'oper1_ind', 'oper2_ind', 'oper3_ind', 'sandgrvqryreclamation',
            'sandgrvqryreclamationcost', 'sandgrvqryreclamationbackfill',
            'SANDGRVQRYWITHINAGLANDRES', 'sandgrvqrylocalgovsoilrembylaw',
            'SANDGRVQRYTOTALEXISTDISTAREA', 'SANDGRVQRYDISTURBEDAREA', 'SANDGRVQRYTIMBERVOLUME',
        )

        print('-------------------------------------------------------')
        print('sand_grv_qry_activity_app_cols Table')
        print(sand_grv_qry_activity_app_cols)
        print('-------------------------------------------------------')

        sand_grv_qry_activity = etl.cutout(sand_grv_qry_activity, 
            'oper1_ind', 'oper2_ind', 'oper3_ind', 'sandgrvqryreclamation',
            'sandgrvqryreclamationcost', 'sandgrvqryreclamationbackfill',
            'SANDGRVQRYWITHINAGLANDRES', 'sandgrvqrylocalgovsoilrembylaw',
            'SANDGRVQRYTOTALEXISTDISTAREA'
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

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_1, key='mms_cid')

    
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'type','Crushing')
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'timbervolume', lambda v: v['act2_vol'])

        sand_grv_qry_activity_2 = etl.cutout(sand_grv_qry_activity_2, 'act2_ind', 'act2_ar', 'act2_vol')

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_2, key='mms_cid')

    
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'type','Mechanical Screening')
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'timbervolume', lambda v: v['act3_vol'])

        sand_grv_qry_activity_3 = etl.cutout(sand_grv_qry_activity_3, 'act3_ind', 'act3_ar', 'act3_vol')

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_3, key='mms_cid')

    
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'type','Washing')
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'timbervolume', lambda v: v['act4_vol'])

        sand_grv_qry_activity_4 = etl.cutout(sand_grv_qry_activity_4, 'act4_ind', 'act4_ar', 'act4_vol')

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_4, key='mms_cid')
        
        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, message_ids, key='mms_cid')
        applications = etl.outerjoin(applications, sand_grv_qry_activity_app_cols, key='mms_cid')

        print('-------------------------------------------------------')
        print('sand_grv_qry_activity_app_cols Table')
        print(etl.header(sand_grv_qry_activity_app_cols))
        print('-------------------------------------------------------')
        
        print('-------------------------------------------------------')
        print('sand_grv_qry_activity Table')
        print(applications[1])
        print('-------------------------------------------------------')

        surface_bulk_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as SurfaceBulkSampleReclamation, recl_dol as surfacebulksamplereclcost, material_desc as surfacebulksamplereclsephandl, drainage_desc as surfacebulksamplerecldrainmiti, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol  from mms.mmsscf_n'
        )

        surface_bulk_activity_app_cols = etl.cut(surface_bulk_activity, ['mms_cid', 'SurfaceBulkSampleReclamation', 'surfacebulksamplereclcost', 'surfacebulksamplereclsephandl', 'surfacebulksamplerecldrainmiti'])

        surface_bulk_activity = etl.cutout(surface_bulk_activity, ['SurfaceBulkSampleReclamation', 'surfacebulksamplereclcost', 'surfacebulksamplereclsephandl', 'surfacebulksamplerecldrainmiti'])

        surface_bulk_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.surface_bulk_sample_activity'
        )
        
        surface_bulk_activity_1 = etl.cut(surface_bulk_activity, [
            'mms_cid', 'act1_ind', 'act1_ar', 'act1_vol'
        ])

        surface_bulk_activity_2 = etl.cut(surface_bulk_activity, [
            'mms_cid', 'act2_ind', 'act2_ar', 'act2_vol'
        ])

        surface_bulk_activity_3 = etl.cut(surface_bulk_activity, [
            'mms_cid', 'act3_ind', 'act3_ar', 'act3_vol'
        ])

        surface_bulk_activity_4 = etl.cut(surface_bulk_activity, [
            'mms_cid', 'act4_ind', 'act4_ar', 'act4_vol'
        ])
        
        surface_bulk_activity_5 = etl.cut(surface_bulk_activity, [
            'mms_cid', 'act5_ind', 'act5_ar', 'act5_vol'
        ])

        surface_bulk_activity_6 = etl.cut(surface_bulk_activity, [
            'mms_cid', 'act6_ind', 'act6_ar', 'act6_vol'
        ])

        surface_bulk_activity_1 = etl.select(surface_bulk_activity_1, lambda v: v['act1_ind'] == 1)
        surface_bulk_activity_2 = etl.select(surface_bulk_activity_2, lambda v: v['act2_ind'] == 1)
        surface_bulk_activity_3 = etl.select(surface_bulk_activity_3, lambda v: v['act3_ind'] == 1)
        surface_bulk_activity_4 = etl.select(surface_bulk_activity_4, lambda v: v['act4_ind'] == 1)
        surface_bulk_activity_5 = etl.select(surface_bulk_activity_5, lambda v: v['act5_ind'] == 1)
        surface_bulk_activity_6 = etl.select(surface_bulk_activity_6, lambda v: v['act6_ind'] == 1)


        surface_bulk_activity_1 = etl.addfield(surface_bulk_activity_1, 'type','Bulk Sample')
        surface_bulk_activity_1 = etl.addfield(surface_bulk_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        surface_bulk_activity_1 = etl.addfield(surface_bulk_activity_1, 'timbervolume', lambda v: v['act1_vol'])

        surface_bulk_activity_1 = etl.cutout(surface_bulk_activity_1, ['act1_ind', 'act1_ar', 'act1_vol'])

        surface_bulk_activity_detail = etl.join(surface_bulk_activity_detail, surface_bulk_activity_1, key='mms_cid')


        surface_bulk_activity_2 = etl.addfield(surface_bulk_activity_2, 'type','Overburden')
        surface_bulk_activity_2 = etl.addfield(surface_bulk_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        surface_bulk_activity_2 = etl.addfield(surface_bulk_activity_2, 'timbervolume', lambda v: v['act2_vol'])

        surface_bulk_activity_2 = etl.cutout(surface_bulk_activity_2, ['act2_ind', 'act2_ar', 'act2_vol'])

        surface_bulk_activity_detail = etl.join(surface_bulk_activity_detail, surface_bulk_activity_2, key='mms_cid')


        surface_bulk_activity_3 = etl.addfield(surface_bulk_activity_3, 'type','Topsoil')
        surface_bulk_activity_3 = etl.addfield(surface_bulk_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        surface_bulk_activity_3 = etl.addfield(surface_bulk_activity_3, 'timbervolume', lambda v: v['act3_vol'])

        surface_bulk_activity_3 = etl.cutout(surface_bulk_activity_3, ['act3_ind', 'act3_ar', 'act3_vol'])

        surface_bulk_activity_detail = etl.join(surface_bulk_activity_detail, surface_bulk_activity_3, key='mms_cid')


        surface_bulk_activity_4 = etl.addfield(surface_bulk_activity_4, 'type','Waste Dumps')
        surface_bulk_activity_4 = etl.addfield(surface_bulk_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        surface_bulk_activity_4 = etl.addfield(surface_bulk_activity_4, 'timbervolume', lambda v: v['act4_vol'])

        surface_bulk_activity_4 = etl.cutout(surface_bulk_activity_4, ['act4_ind', 'act4_ar', 'act4_vol'])

        surface_bulk_activity_detail = etl.join(surface_bulk_activity_detail, surface_bulk_activity_4, key='mms_cid')


        surface_bulk_activity_5 = etl.addfield(surface_bulk_activity_5, 'type','Equipment and Service Facilities')
        surface_bulk_activity_5 = etl.addfield(surface_bulk_activity_5, 'disturbedarea', lambda v: v['act5_ar'])
        surface_bulk_activity_5 = etl.addfield(surface_bulk_activity_5, 'timbervolume', lambda v: v['act5_vol'])

        surface_bulk_activity_5 = etl.cutout(surface_bulk_activity_5, ['act5_ind', 'act5_ar', 'act5_vol'])

        surface_bulk_activity_detail = etl.join(surface_bulk_activity_detail, surface_bulk_activity_5, key='mms_cid')

        surface_bulk_activity_6 = etl.addfield(surface_bulk_activity_1, 'type','Processing Facilities')
        surface_bulk_activity_6 = etl.addfield(surface_bulk_activity_1, 'disturbedarea', lambda v: v['act6_ar'])
        surface_bulk_activity_6 = etl.addfield(surface_bulk_activity_1, 'timbervolume', lambda v: v['act6_vol'])

        surface_bulk_activity_6 = etl.cutout(surface_bulk_activity_6, ['act6_ind', 'act6_ar', 'act6_vol'])

        surface_bulk_activity_detail = etl.join(surface_bulk_activity_detail, surface_bulk_activity_6, key='mms_cid')

        surface_bulk_activity_detail = etl.join(surface_bulk_activity_detail, message_ids, key='mms_cid')
        applications = etl.outerjoin(applications, surface_bulk_activity_app_cols, key='mms_cid')

        cut_lines = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, line_km as CutLinesExplGridTotalLineKms, t_vol as CutLinesExplGridTimberVolume, recl_desc as CutLinesReclamation, recl_dol as CutLinesReclamationcost, t_ar as CutLinesExplGridDisturbedArea from mms.mmssco_n'
        )

        applications = etl.outerjoin(applications, cut_lines, key='mms_cid')

        exploration_access = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as ExpAccessReclamation, recl_dol as ExpAccessReclamationcost, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act7_ind, act1_len, act2_len, act3_len, act4_len, act5_len, act6_len, act7_len, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act7_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol, act7_vol from mms.mmssce_n'
        )

        exploration_access_app_cols = etl.cut(exploration_access, [
            'mms_cid', 'ExpAccessReclamation', 'ExpAccessReclamationcost'
        ])

        exploration_access = etl.cutout(exploration_access, [
            'ExpAccessReclamation', 'ExpAccessReclamationcost'
        ])

        exploration_access_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.exp_access_activity'
        )
        
        exploration_access_activity_1 = etl.cut(exploration_access, [
            'mms_cid', 'act1_ind', 'act1_len', 'act1_ar', 'act1_vol'
        ])

        exploration_access_activity_2 = etl.cut(exploration_access, [
            'mms_cid', 'act2_ind', 'act2_len', 'act2_ar', 'act2_vol'
        ])

        exploration_access_activity_3 = etl.cut(exploration_access, [
            'mms_cid', 'act3_ind', 'act3_len', 'act3_ar', 'act3_vol'
        ])

        exploration_access_activity_4 = etl.cut(exploration_access, [
            'mms_cid', 'act4_ind', 'act4_len', 'act4_ar', 'act4_vol'
        ])
        
        exploration_access_activity_5 = etl.cut(exploration_access, [
            'mms_cid', 'act5_ind', 'act5_len', 'act5_ar', 'act5_vol'
        ])

        exploration_access_activity_6 = etl.cut(exploration_access, [
            'mms_cid', 'act6_ind', 'act6_len', 'act6_ar', 'act6_vol'
        ])

        exploration_access_activity_7 = etl.cut(exploration_access, [
            'mms_cid', 'act7_ind', 'act7_len', 'act7_ar', 'act7_vol'
        ])

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

        exploration_access_activity_1 = etl.cutout(exploration_access_activity_1, ['act1_ind', 'act1_len', 'act1_ar', 'act1_vol'])

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, exploration_access_activity_1, key='mms_cid')


        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'type','Temporary Road - New')
        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'timbervolume', lambda v: v['act2_vol'])
        exploration_access_activity_2 = etl.addfield(exploration_access_activity_2, 'length', lambda v: v['act2_len'])

        exploration_access_activity_2 = etl.cutout(exploration_access_activity_2, ['act2_ind', 'act2_len', 'act2_ar', 'act2_vol'])

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, exploration_access_activity_2, key='mms_cid')


        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'type','Exploration Trail or Exploration Trail - New')
        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'timbervolume', lambda v: v['act3_vol'])
        exploration_access_activity_3 = etl.addfield(exploration_access_activity_3, 'length', lambda v: v['act3_len'])

        exploration_access_activity_3 = etl.cutout(exploration_access_activity_3, ['act3_ind', 'act3_len', 'act3_ar', 'act3_vol'])

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, exploration_access_activity_3, key='mms_cid')


        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'type','Excavated Trail - Modification or Existing Access Modification')
        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'timbervolume', lambda v: v['act4_vol'])
        exploration_access_activity_4 = etl.addfield(exploration_access_activity_4, 'length', lambda v: v['act4_len'])

        exploration_access_activity_4 = etl.cutout(exploration_access_activity_4, ['act4_ind', 'act4_len', 'act4_ar', 'act4_vol'])

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, exploration_access_activity_4, key='mms_cid')


        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'type','Helicopter Pad(s)')
        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'disturbedarea', lambda v: v['act5_ar'])
        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'timbervolume', lambda v: v['act5_vol'])
        exploration_access_activity_5 = etl.addfield(exploration_access_activity_5, 'length', lambda v: v['act5_len'])
 
        exploration_access_activity_5 = etl.cutout(exploration_access_activity_5, ['act5_ind', 'act5_len', 'act5_ar', 'act5_vol'])

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, exploration_access_activity_5, key='mms_cid')


        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'type','Processing Facilities')
        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'disturbedarea', lambda v: v['act6_ar'])
        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'timbervolume', lambda v: v['act6_vol'])
        exploration_access_activity_6 = etl.addfield(exploration_access_activity_6, 'length', lambda v: v['act6_len'])

        exploration_access_activity_6 = etl.cutout(exploration_access_activity_6, ['act6_ind', 'act6_len', 'act6_ar', 'act6_vol'])

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, exploration_access_activity_6, key='mms_cid')


        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'type','Temporary Air Strip')
        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'disturbedarea', lambda v: v['act7_ar'])
        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'timbervolume', lambda v: v['act7_vol'])
        exploration_access_activity_7 = etl.addfield(exploration_access_activity_7, 'length', lambda v: v['act7_len'])

        exploration_access_activity_7 = etl.cutout(exploration_access_activity_7, ['act7_ind', 'act7_len', 'act7_ar', 'act7_vol'])

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, exploration_access_activity_7, key='mms_cid')

        exploration_access_activity_detail = etl.join(exploration_access_activity_detail, message_ids, key='mms_cid')
        applications = etl.outerjoin(applications, exploration_access_app_cols, key='mms_cid')

        exploration_surface_drill = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as ExpSurfaceDrillReclamation, recl_dol as ExpSurfaceDrillReclamationcost, storage_desc as ExpSurfaceDrillReclCoreStorage, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act7_ind, act8_ind, act1_cnt, act2_cnt, act3_cnt, act4_cnt, act5_cnt, act6_cnt, act7_cnt, act8_cnt, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act7_ar, act8_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol, act7_vol, act8_vol from mms.mmsscd_n'
        )

        exploration_surface_drill_app_cols = etl.cut(exploration_surface_drill, [
            'mms_cid', 'ExpSurfaceDrillReclamation', 'ExpSurfaceDrillReclamationcost', 'ExpSurfaceDrillReclCoreStorage'
        ])

        exploration_surface_drill = etl.cutout(exploration_surface_drill, [
            'ExpSurfaceDrillReclamation', 'ExpSurfaceDrillReclamationcost', 'ExpSurfaceDrillReclCoreStorage'
        ])

        exploration_surface_drill_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.exp_access_activity'
        )
        
        exploration_surface_drill_activity_1 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol'
        ])

        exploration_surface_drill_activity_2 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act2_ind', 'act2_cnt', 'act2_ar', 'act2_vol'
        ])

        exploration_surface_drill_activity_3 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act3_ind', 'act3_cnt', 'act3_ar', 'act3_vol'
        ])

        exploration_surface_drill_activity_4 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act4_ind', 'act4_cnt', 'act4_ar', 'act4_vol'
        ])
        
        exploration_surface_drill_activity_5 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act5_ind', 'act5_cnt', 'act5_ar', 'act5_vol'
        ])

        exploration_surface_drill_activity_6 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act6_ind', 'act6_cnt', 'act6_ar', 'act6_vol'
        ])

        exploration_surface_drill_activity_7 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act7_ind', 'act7_cnt', 'act7_ar', 'act7_vol'
        ])

        exploration_surface_drill_activity_8 = etl.cut(exploration_surface_drill, [
            'mms_cid', 'act8_ind', 'act8_cnt', 'act8_ar', 'act8_vol'
        ])

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

        exploration_surface_drill_activity_1 = etl.cutout(exploration_surface_drill_activity_1, ['act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_1, key='mms_cid')


        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'type','Diamond Drilling - Underground')
        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'timbervolume', lambda v: v['act2_vol'])
        exploration_surface_drill_activity_2 = etl.addfield(exploration_surface_drill_activity_2, 'numberofsites', lambda v: v['act2_cnt'])

        exploration_surface_drill_activity_2 = etl.cutout(exploration_surface_drill_activity_2, ['act2_ind', 'act2_len', 'act2_ar', 'act2_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_2, key='mms_cid')


        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'type','Geotechnical')
        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'timbervolume', lambda v: v['act3_vol'])
        exploration_surface_drill_activity_3 = etl.addfield(exploration_surface_drill_activity_3, 'numberofsites', lambda v: v['act3_cnt'])

        exploration_surface_drill_activity_3 = etl.cutout(exploration_surface_drill_activity_3, ['act3_ind', 'act3_len', 'act3_ar', 'act3_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_3, key='mms_cid')


        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'type','Reverse Circulation')
        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'timbervolume', lambda v: v['act4_vol'])
        exploration_surface_drill_activity_4 = etl.addfield(exploration_surface_drill_activity_4, 'numberofsites', lambda v: v['act4_cnt'])

        exploration_surface_drill_activity_4 = etl.cutout(exploration_surface_drill_activity_4, ['act4_ind', 'act4_len', 'act4_ar', 'act4_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_4, key='mms_cid')


        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'type','Percussion')
        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'disturbedarea', lambda v: v['act5_ar'])
        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'timbervolume', lambda v: v['act5_vol'])
        exploration_surface_drill_activity_5 = etl.addfield(exploration_surface_drill_activity_5, 'numberofsites', lambda v: v['act5_cnt'])
 
        exploration_access_activity_5 = etl.cutout(exploration_surface_drill_activity_5, ['act5_ind', 'act5_len', 'act5_ar', 'act5_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_5, key='mms_cid')


        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'type','Becker')
        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'disturbedarea', lambda v: v['act6_ar'])
        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'timbervolume', lambda v: v['act6_vol'])
        exploration_surface_drill_activity_6 = etl.addfield(exploration_surface_drill_activity_6, 'numberofsites', lambda v: v['act6_cnt'])

        exploration_surface_drill_activity_6 = etl.cutout(exploration_surface_drill_activity_6, ['act6_ind', 'act6_len', 'act6_ar', 'act6_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_6, key='mms_cid')


        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'type','Sonic')
        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'disturbedarea', lambda v: v['act7_ar'])
        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'timbervolume', lambda v: v['act7_vol'])
        exploration_surface_drill_activity_7 = etl.addfield(exploration_surface_drill_activity_7, 'numberofsites', lambda v: v['act7_cnt'])

        exploration_surface_drill_activity_7 = etl.cutout(exploration_surface_drill_activity_7, ['act7_ind', 'act7_len', 'act7_ar', 'act7_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_7, key='mms_cid')

        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'type','Temporary Air Strip')
        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'disturbedarea', lambda v: v['act8_ar'])
        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'timbervolume', lambda v: v['act8_vol'])
        exploration_surface_drill_activity_8 = etl.addfield(exploration_surface_drill_activity_8, 'numberofsites', lambda v: v['act8_cnt'])

        exploration_surface_drill_activity_8 = etl.cutout(exploration_surface_drill_activity_8, ['act8_ind', 'act8_len', 'act8_ar', 'act8_vol'])

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, exploration_surface_drill_activity_8, key='mms_cid')

        exploration_surface_drill_activity_detail = etl.join(exploration_surface_drill_activity_detail, message_ids, key='mms_cid')
        applications = etl.outerjoin(applications, exploration_surface_drill_app_cols, key='mms_cid')

        mech_trenching = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as MechTrenchingReclamation, recl_dol as MechTrenchingReclamationcost, material_desc as surfacebulksamplereclsephandl, drainage_desc as surfacebulksamplerecldrainmiti, act1_ind, act2_ind, act1_cnt, act2_cnt, act1_ar, act2_ar, act1_vol, act2_vol from mms.mmsscb_n'
        )

        mech_trenching_app_cols = etl.cut(mech_trenching, [
            'mms_cid', 'MechTrenchingReclamation', 'MechTrenchingReclamationcost'
        ])

        mech_trenching = etl.cutout(mech_trenching, [
            'MechTrenchingReclamation', 'MechTrenchingReclamationcost'
        ])

        mech_trenching_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.mech_trenching_activity'
        )
        
        mech_trenching_activity_1 = etl.cut(mech_trenching, [
            'mms_cid', 'act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol'
        ])

        mech_trenching_activity_2 = etl.cut(mech_trenching, [
            'mms_cid', 'act2_ind', 'act2_cnt', 'act2_ar', 'act2_vol'
        ])

        mech_trenching_activity_1 = etl.select(mech_trenching_activity_1, lambda v: v['act1_ind'] == 1)
        mech_trenching_activity_2 = etl.select(mech_trenching_activity_2, lambda v: v['act2_ind'] == 1)
    
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'type','Trenches and Test Pits')
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'timbervolume', lambda v: v['act1_vol'])
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'numberofsites', lambda v: v['act1_cnt'])

        mech_trenching_activity_1 = etl.cutout(mech_trenching_activity_1, ['act1_ind', 'act1_cnt', 'act1_ar', 'act1_vol'])

        mech_trenching_activity_detail = etl.join(mech_trenching_activity_detail, mech_trenching_activity_1, key='mms_cid')
    
        mech_trenching_activity_2 = etl.addfield(mech_trenching_activity_2, 'type','Stockpiles')
        mech_trenching_activity_2 = etl.addfield(mech_trenching_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        mech_trenching_activity_2 = etl.addfield(mech_trenching_activity_2, 'timbervolume', lambda v: v['act2_vol'])
        mech_trenching_activity_1 = etl.addfield(mech_trenching_activity_1, 'numberofsites', lambda v: v['act2_cnt'])

        mech_trenching_activity_2 = etl.cutout(mech_trenching_activity_2, ['act2_ind', 'act2_cnt', 'act2_ar', 'act2_vol'])

        mech_trenching_activity_detail = etl.join(mech_trenching_activity_detail, mech_trenching_activity_2, key='mms_cid')

        mech_trenching_activity_detail = etl.join(mech_trenching_activity_detail, message_ids, key='mms_cid')
        applications = etl.outerjoin(applications, mech_trenching_app_cols, key='mms_cid')

        under_exp_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as UnderExpReclamation, recl_dol as UnderExpReclamationcost, t_ar as UNDEREXPSURFACETOTALDISTAREA, t_vol as UNDEREXPSURFACETIMBERVOLUME, devr1_ind, devr2_ind, devr3_ind, devr4_ind, devr5_ind, devr6_ind, devr7_ind, devr8_ind, devr1_ct, devr2_ct, devr3_ct, devr4_ct, devr5_ct, devr6_ct, devr7_ct, devr8_ct, devn1_ind, devn2_ind, devn3_ind, devn4_ind, devn5_ind, devn6_ind, devn7_ind, devn8_ind, devn1_ct, devn2_ct, devn3_ct, devn4_ct, devn5_ct, devn6_ct, devn7_ct, devn8_ct, surf1_ind, surf2_ind, surf3_ind, surf4_ind, surf7_ind, surf8_ind, surf9_ind, surf10_ind, surf1_ct, surf2_ct, surf3_ct, surf4_ct, surf7_ct, surf8_ct, surf9_ct, surf10_ct, surf1_ar, surf2_ar, surf3_ar, surf4_ar, surf7_ar, surf8_ar, surf9_ar, surf10_ar, surf1_vol, surf2_vol, surf3_vol, surf4_vol, surf7_vol, surf8_vol, surf9_vol, surf10_vol from mms.mmsscg_n'
        )

        under_exp_activity_app_cols = etl.cut(mech_trenching, [
            'mms_cid', 'UnderExpReclamation', 'UnderExpReclamationcost', 'UNDEREXPSURFACETOTALDISTAREA', 'UNDEREXPSURFACETIMBERVOLUME'
        ])

        under_exp_activity = etl.cutout(mech_trenching, [
            'UnderExpReclamation', 'UnderExpReclamationcost', 'UNDEREXPSURFACETOTALDISTAREA', 'UNDEREXPSURFACETIMBERVOLUME'
        ])
        
        under_exp_surface_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.under_exp_surface_activity'
        )

        under_exp_surface_activity_1 = etl.cut(under_exp_activity, ['mms_cid', 'surf1_ind', 'surf1_ct', 'surf1_ar', 'surf1_vol'])
        under_exp_surface_activity_2 = etl.cut(under_exp_activity, ['mms_cid', 'surf2_ind', 'surf2_ct', 'surf2_ar', 'surf2_vol'])
        under_exp_surface_activity_3 = etl.cut(under_exp_activity, ['mms_cid', 'surf3_ind', 'surf3_ct', 'surf3_ar', 'surf3_vol'])
        under_exp_surface_activity_4 = etl.cut(under_exp_activity, ['mms_cid', 'surf4_ind', 'surf4_ct', 'surf4_ar', 'surf4_vol'])
        under_exp_surface_activity_7 = etl.cut(under_exp_activity, ['mms_cid', 'surf7_ind', 'surf7_ct', 'surf7_ar', 'surf7_vol'])
        under_exp_surface_activity_8 = etl.cut(under_exp_activity, ['mms_cid', 'surf8_ind', 'surf8_ct', 'surf8_ar', 'surf8_vol'])
        under_exp_surface_activity_9 = etl.cut(under_exp_activity, ['mms_cid', 'surf9_ind', 'surf9_ct', 'surf9_ar', 'surf9_vol'])
        under_exp_surface_activity_10 = etl.cut(under_exp_activity, ['mms_cid', 'surf10_ind', 'surf10_ct', 'surf10_ar', 'surf10_vol'])

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

        under_exp_surface_activity_1 = etl.cutout(under_exp_surface_activity_1, ['surf1_ind', 'surf1_ct', 'surf1_ar', 'surf1_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_1, key='mms_cid')
    
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'type','Ore Dump')
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'quantity', lambda v: v['surf2_ct'])
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'disturbedarea', lambda v: v['surf2_ar'])
        under_exp_surface_activity_2 = etl.addfield(under_exp_surface_activity_2, 'timbervolume', lambda v: v['surf2_vol'])

        under_exp_surface_activity_2 = etl.cutout(under_exp_surface_activity_2, ['surf2_ind', 'surf2_ct', 'surf2_ar', 'surf2_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_2, key='mms_cid')

        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'type','Waste Dump')
        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'quantity', lambda v: v['surf3_ct'])
        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'disturbedarea', lambda v: v['surf3_ar'])
        under_exp_surface_activity_3 = etl.addfield(under_exp_surface_activity_3, 'timbervolume', lambda v: v['surf3_vol'])

        under_exp_surface_activity_3 = etl.cutout(under_exp_surface_activity_3, ['surf3_ind', 'surf3_ct', 'surf3_ar', 'surf3_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_3, key='mms_cid')

        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'type','Soil/Overburden')
        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'quantity', lambda v: v['surf4_ct'])
        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'disturbedarea', lambda v: v['surf4_ar'])
        under_exp_surface_activity_4 = etl.addfield(under_exp_surface_activity_4, 'timbervolume', lambda v: v['surf4_vol'])

        under_exp_surface_activity_4 = etl.cutout(under_exp_surface_activity_4, ['surf4_ind', 'surf4_ct', 'surf4_ar', 'surf4_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_4, key='mms_cid')
    
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'type','Equipment Lay-down Area')
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'quantity', lambda v: v['surf7_ct'])
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'disturbedarea', lambda v: v['surf7_ar'])
        under_exp_surface_activity_7 = etl.addfield(under_exp_surface_activity_7, 'timbervolume', lambda v: v['surf7_vol'])

        under_exp_surface_activity_7 = etl.cutout(under_exp_surface_activity_7, ['surf7_ind', 'surf7_ct', 'surf7_ar', 'surf7_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_7, key='mms_cid')

        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'type','Fuel Storage (for the mine)')
        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'quantity', lambda v: v['surf8_ct'])
        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'disturbedarea', lambda v: v['surf8_ar'])
        under_exp_surface_activity_8 = etl.addfield(under_exp_surface_activity_8, 'timbervolume', lambda v: v['surf8_vol'])

        under_exp_surface_activity_8 = etl.cutout(under_exp_surface_activity_8, ['surf8_ind', 'surf8_ct', 'surf8_ar', 'surf8_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_8, key='mms_cid')
    
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'type','Other')
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'quantity', lambda v: v['surf9_ct'])
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'disturbedarea', lambda v: v['surf9_ar'])
        under_exp_surface_activity_9 = etl.addfield(under_exp_surface_activity_9, 'timbervolume', lambda v: v['surf9_vol'])

        under_exp_surface_activity_9 = etl.cutout(under_exp_surface_activity_9, ['surf9_ind', 'surf9_ct', 'surf9_ar', 'surf9_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_9, key='mms_cid')

        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'type','Shaft')
        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'quantity', lambda v: v['surf10_ct'])
        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'disturbedarea', lambda v: v['surf10_ar'])
        under_exp_surface_activity_10 = etl.addfield(under_exp_surface_activity_10, 'timbervolume', lambda v: v['surf10_vol'])

        under_exp_surface_activity_10 = etl.cutout(under_exp_surface_activity_10, ['surf10_ind', 'surf10_ct', 'surf10_ar', 'surf10_vol'])

        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, under_exp_surface_activity_10, key='mms_cid')
        under_exp_surface_activity_detail = etl.join(under_exp_surface_activity_detail, message_ids, key='mms_cid')

        under_exp_new_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.under_exp_new_activity'
        )

        under_exp_new_activity_1 = etl.cut(under_exp_activity, ['mms_cid', 'devn1_ind', 'devn1_ct'])
        under_exp_new_activity_2 = etl.cut(under_exp_activity, ['mms_cid', 'devn2_ind', 'devn2_ct'])
        under_exp_new_activity_3 = etl.cut(under_exp_activity, ['mms_cid', 'devn3_ind', 'devn3_ct'])
        under_exp_new_activity_4 = etl.cut(under_exp_activity, ['mms_cid', 'devn4_ind', 'devn4_ct'])
        under_exp_new_activity_5 = etl.cut(under_exp_activity, ['mms_cid', 'devn5_ind', 'devn5_ct'])
        under_exp_new_activity_6 = etl.cut(under_exp_activity, ['mms_cid', 'devn6_ind', 'devn6_ct'])
        under_exp_new_activity_7 = etl.cut(under_exp_activity, ['mms_cid', 'devn7_ind', 'devn7_ct'])
        under_exp_new_activity_8 = etl.cut(under_exp_activity, ['mms_cid', 'devn8_ind', 'devn8_ct'])

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

        under_exp_new_activity_1 = etl.cutout(under_exp_new_activity_1, ['devn1_ind', 'devn1_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_1, key='mms_cid')
    
        under_exp_new_activity_2 = etl.addfield(under_exp_new_activity_2, 'type','Drifts')
        under_exp_new_activity_2 = etl.addfield(under_exp_new_activity_2, 'quantity', lambda v: v['devn2_ct'])

        under_exp_new_activity_2 = etl.cutout(under_exp_new_activity_2, ['devn2_ind', 'devn2_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_2, key='mms_cid')

        under_exp_new_activity_3 = etl.addfield(under_exp_new_activity_3, 'type','Raises')
        under_exp_new_activity_3 = etl.addfield(under_exp_new_activity_3, 'quantity', lambda v: v['devn3_ct'])

        under_exp_new_activity_3 = etl.cutout(under_exp_new_activity_3, ['devn3_ind', 'devn3_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_3, key='mms_cid')

        under_exp_new_activity_4 = etl.addfield(under_exp_new_activity_4, 'type','Ramps')
        under_exp_new_activity_4 = etl.addfield(under_exp_new_activity_4, 'quantity', lambda v: v['devn4_ct'])

        under_exp_new_activity_4 = etl.cutout(under_exp_new_activity_4, ['devn4_ind', 'devn4_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_4, key='mms_cid')

        under_exp_new_activity_5 = etl.addfield(under_exp_new_activity_5, 'type','Shafts')
        under_exp_new_activity_5 = etl.addfield(under_exp_new_activity_5, 'quantity', lambda v: v['devn5_ct'])

        under_exp_new_activity_5 = etl.cutout(under_exp_new_activity_5, ['devn5_ind', 'devn5_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_5, key='mms_cid')

        under_exp_new_activity_6 = etl.addfield(under_exp_new_activity_6, 'type','De-Pillar')
        under_exp_new_activity_6 = etl.addfield(under_exp_new_activity_6, 'quantity', lambda v: v['devn6_ct'])

        under_exp_new_activity_6 = etl.cutout(under_exp_new_activity_6, ['devn6_ind', 'devn6_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_6, key='mms_cid')

        under_exp_new_activity_7 = etl.addfield(under_exp_new_activity_7, 'type', 'Other')
        under_exp_new_activity_7 = etl.addfield(under_exp_new_activity_7, 'quantity', lambda v: v['devn7_ct'])

        under_exp_new_activity_7 = etl.cutout(under_exp_new_activity_7, ['devn7_ind', 'devn7_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_7, key='mms_cid')

        under_exp_new_activity_8 = etl.addfield(under_exp_new_activity_8, 'type','Stope')
        under_exp_new_activity_8 = etl.addfield(under_exp_new_activity_8, 'quantity', lambda v: v['devn8_ct'])

        under_exp_new_activity_8 = etl.cutout(under_exp_new_activity_8, ['devn8_ind', 'devn8_ct'])

        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, under_exp_new_activity_8, key='mms_cid')
        under_exp_new_activity_detail = etl.join(under_exp_new_activity_detail, message_ids, key='mms_cid')

        under_exp_rehab_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.under_exp_rehab_activity'
        )

        under_exp_rehab_activity_1 = etl.cut(under_exp_activity, ['mms_cid', 'devr1_ind', 'devr1_ct'])
        under_exp_rehab_activity_2 = etl.cut(under_exp_activity, ['mms_cid', 'devr2_ind', 'devr2_ct'])
        under_exp_rehab_activity_3 = etl.cut(under_exp_activity, ['mms_cid', 'devr3_ind', 'devr3_ct'])
        under_exp_rehab_activity_4 = etl.cut(under_exp_activity, ['mms_cid', 'devr4_ind', 'devr4_ct'])
        under_exp_rehab_activity_5 = etl.cut(under_exp_activity, ['mms_cid', 'devr5_ind', 'devr5_ct'])
        under_exp_rehab_activity_6 = etl.cut(under_exp_activity, ['mms_cid', 'devr6_ind', 'devr6_ct'])
        under_exp_rehab_activity_7 = etl.cut(under_exp_activity, ['mms_cid', 'devr7_ind', 'devr7_ct'])
        under_exp_rehab_activity_8 = etl.cut(under_exp_activity, ['mms_cid', 'devr8_ind', 'devr8_ct'])

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

        under_exp_rehab_activity_1 = etl.cutout(under_exp_rehab_activity_1, ['devr1_ind', 'devr1_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_1, key='mms_cid')
    
        under_exp_rehab_activity_2 = etl.addfield(under_exp_rehab_activity_2, 'type','Drifts')
        under_exp_rehab_activity_2 = etl.addfield(under_exp_rehab_activity_2, 'quantity', lambda v: v['devr2_ct'])

        under_exp_rehab_activity_2 = etl.cutout(under_exp_rehab_activity_2, ['devr2_ind', 'devr2_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_2, key='mms_cid')

        under_exp_rehab_activity_3 = etl.addfield(under_exp_rehab_activity_3, 'type','Raises')
        under_exp_rehab_activity_3 = etl.addfield(under_exp_rehab_activity_3, 'quantity', lambda v: v['devr3_ct'])

        under_exp_rehab_activity_3 = etl.cutout(under_exp_rehab_activity_3, ['devr3_ind', 'devr3_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_3, key='mms_cid')

        under_exp_rehab_activity_4 = etl.addfield(under_exp_rehab_activity_4, 'type','Ramps')
        under_exp_rehab_activity_4 = etl.addfield(under_exp_rehab_activity_4, 'quantity', lambda v: v['devr4_ct'])

        under_exp_rehab_activity_4 = etl.cutout(under_exp_rehab_activity_4, ['devr4_ind', 'devr4_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_4, key='mms_cid')

        under_exp_rehab_activity_5 = etl.addfield(under_exp_rehab_activity_5, 'type','Shafts')
        under_exp_rehab_activity_5 = etl.addfield(under_exp_rehab_activity_5, 'quantity', lambda v: v['devr5_ct'])

        under_exp_rehab_activity_5 = etl.cutout(under_exp_rehab_activity_5, ['devr5_ind', 'devr5_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_5, key='mms_cid')

        under_exp_rehab_activity_6 = etl.addfield(under_exp_rehab_activity_6, 'type','De-Pillar')
        under_exp_rehab_activity_6 = etl.addfield(under_exp_rehab_activity_6, 'quantity', lambda v: v['devr6_ct'])

        under_exp_rehab_activity_6 = etl.cutout(under_exp_rehab_activity_6, ['devr6_ind', 'devr6_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_6, key='mms_cid')

        under_exp_rehab_activity_7 = etl.addfield(under_exp_rehab_activity_7, 'type', 'Other')
        under_exp_rehab_activity_7 = etl.addfield(under_exp_rehab_activity_7, 'quantity', lambda v: v['devr7_ct'])

        under_exp_rehab_activity_7 = etl.cutout(under_exp_rehab_activity_7, ['devr7_ind', 'devr7_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_7, key='mms_cid')

        under_exp_rehab_activity_8 = etl.addfield(under_exp_rehab_activity_8, 'type','Stope')
        under_exp_rehab_activity_8 = etl.addfield(under_exp_rehab_activity_8, 'quantity', lambda v: v['devr8_ct'])

        under_exp_rehab_activity_8 = etl.cutout(under_exp_rehab_activity_8, ['devr8_ind', 'devr8_ct'])

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, under_exp_rehab_activity_8, key='mms_cid')

        under_exp_rehab_activity_detail = etl.join(under_exp_rehab_activity_detail, message_ids, key='mms_cid')
        applications = etl.outerjoin(applications, under_exp_activity_app_cols, key='mms_cid')

        camps = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, act1_ar as CampDisturbedArea, act1_vol as CampTimberVolume, act2_ar as BldgDisturbedArea, act2_vol as BldgTimberVolume, act3_ar as StgeDisturbedArea, act3_vol as StgeTimberVolume, recl_desc as CBSFReclamation, recl_dol as CBSFReclamationcost from mms.mmssca_n'
        )

        applications = etl.outerjoin(applications, camps, key='mms_cid')

        timber_cutting = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, tot_bol as TimberTotalVolume, fup_ind as FreeUsePermit, ltc_ind as LicenceToCut from mms.mmssck_n'
        )

        applications = etl.outerjoin(applications, timber_cutting, key='mms_cid')

        explosive_permits = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, perm_ind as BCExplosivesPermitIssued, perm_no as BCExplosivesPermitNumber, expry_dt as BCExplosivesPermitExpiry from mms.mmsscc_n'
        )

        applications = etl.outerjoin(applications, explosive_permits, key='mms_cid')

        contacts = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, mine_no, name, l_name, phone, tel_ext, fax, email, street, city, prov, post_cd, entered_by from mms.mmsscc_n'
        )

        contact_type = etl.fromdb(connection,
                                  f'SELECT cid as mms_cid, cid_ccn, type_ind from mms.mmsccc')

        streamline_application = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recv_dt as receiveddate, pmt_typ, comm_desc, exp_desc as DescExplorationProgram, ten_nos1, ten_nos2, cg_clms1, cg_clms2, legal_desc1, legal_desc2, priv_ind, water_ind, culture_ind, fuel_ind, ltr_amt as FuelLubStored, barrel_ind, bulk_ind, str_dt_seasonal as startworkdate, end_dt_seasonal as endworkdate from mmsstream_now'
        )

        streamline_application = etl.addfield(
            streamline_application, 'typeofapplication',
            lambda v: 'New Permit' if v['pmt_typ'] == 'N' else 'Amendment')

        streamline_application = etl.addfield(
            streamline_application, 'FirstAidEquipmentOnsite',
            lambda v: v['comm_desc'].split('  ')[0] if (v['comm_desc'] != '' or v['comm_desc'] is not None) else None)
        
        streamline_application = etl.addfield(
            streamline_application, 'FirstAidCertLevel',
            lambda v: v['comm_desc'].split('  ')[1] if (v['comm_desc'] != '' or v['comm_desc'] is not None) else None)
        
        streamline_application = etl.addfield(
            streamline_application, 'TenureNumbers',
            lambda v: v['ten_nos1'] + v['ten_nos2'])
        
        streamline_application = etl.addfield(
            streamline_application, 'CrownGrantLotNumbers',
            lambda v: v['cg_clms1'] + v['cg_clms2'])
        
        streamline_application = etl.addfield(
            streamline_application, 'LandLegalDesc',
            lambda v: v['legal_desc1'] + v['legal_desc2'])
        
        streamline_application = etl.addfield(
            streamline_application, 'LandPrivate',
            lambda v: 'Yes' if v['priv_ind'] == 1 else 'No')
        
        streamline_application = etl.addfield(
            streamline_application, 'LandCommunityWatershed',
            lambda v: 'Yes' if v['water_ind'] == 1 else 'No')
        
        streamline_application = etl.addfield(
            streamline_application, 'ArchSitesAffected',
            lambda v: 'Yes' if v['culture_ind'] == 1 else 'No')
        
        streamline_application = etl.addfield(
            streamline_application, 'FuelLubStoreOnSite',
            lambda v: 'Yes' if v['fuel_ind'] == 1 else 'No')
        
        streamline_application = etl.addfield(
            streamline_application, 'FuelLubStoreMethodBarrel',
            lambda v: 'Yes' if v['barrel_ind'] == 1 else 'No')
        
        streamline_application = etl.addfield(
            streamline_application, 'FuelLubStoreMethodBulk',
            lambda v: 'Yes' if v['bulk_ind'] == 1 else 'No')
        
        streamline_application = etl.cutout(streamline_application, ['comm_desc', 'pmt_typ', 'ten_nos1', 'ten_nos2', 'cg_clms1', 'cg_clms2', 'legal_desc1', 'legal_desc2', 'priv_ind', 'water_ind', 'culture_ind', 'fuel_ind', 'barrel_ind', 'bulk_ind'])

        streamline_application_app_cols = etl.cutout(streamline_application, ['str_dt_seasonal', 'end_dt_seasonal'])
        
        streamline_application = etl.cut(streamline_application, ['mms_cid', 'startworkdate', 'endworkdate'])
        streamline_application = etl.join(streamline_application, message_ids, key='mms_cid')

        applications = etl.outerjoin(applications, streamline_application_app_cols, key='mms_cid')

        water_source_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, water_nm as sourcewatersupply, activity as type, water_use as useofwater, water_vol as EstimateRateWater, pump_size as PumpSizeInWater, water_intake as LocationWaterIntake from mms.mmsscp_n_d'
        )

        water_source_activity = etl.join(water_source_activity, message_ids, key='mms_cid')

        application_nda = etl.fromdb(
            connection,
            f'SELECT * from mms.mmsnda'
        )

        application_nda = etl.cutout(application_nda, 'oldenddate')

        etl.appenddb(applications, connection, 'application', schema='mms_now_submissions', commit=False)
        etl.appenddb(water_source_activity, connection, 'water_source_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(streamline_application, connection, 'application_start_stop', schema='mms_now_submissions', commit=False)
        etl.appenddb(sand_grv_qry_activity_detail, connection, 'sand_grv_qry_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(surface_bulk_activity_detail, connection, 'surface_bulk_sample_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(exploration_access_activity_detail, connection, 'exp_access_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(mech_trenching_activity_detail, connection, 'mech_trenching_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(under_exp_rehab_activity_detail, connection, 'under_exp_rehab_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(under_exp_surface_activity_detail, connection, 'under_exp_surface_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(under_exp_new_activity_detail, connection, 'under_exp_new_activity', schema='mms_now_submissions', commit=False)
        etl.appenddb(application_nda, connection, 'application_nda', schema='mms_now_submissions', commit=False)                        

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
