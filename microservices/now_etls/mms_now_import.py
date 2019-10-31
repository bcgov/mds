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


def ETL_MMS_NOW_schema(connection, tables, schema, system_name):
    '''Import all the data from the specified schema and tables.'''
    try:
        applications = etl.fromdb(
            connection,
            f'SELECT msg_id as messageid, cid as mms_cid, mine_no as minenumber, apl_dt as submitteddate, lat_dec as latitude, lon_dec as longitude, multi_year_ind, multi_year_area_ind, str_Dt as ProposedStartDate, end_dt as ProposedEndDate, site_desc as SiteDirections, prpty_nm as NameOfProperty, apl_typ from mms.mmsnow'
        )

        print('-------------------------------------------------------')
        print('application Table')
        print(applications[1])
        print('-------------------------------------------------------')

        applications = etl.addfield(
            applications, 'NoticeOfWorkType',
            lambda v: 'Mineral' if v['apl_typ'] == 'M' else ('Placer Operations' if v['apl_typ'] == 'P' else 'Sand & Gravel')
        )

        applications = etl.cutout(applications, 'apl_typ')

        message_ids = etl.cut(applications, ['mms_cid', 'messageid'])

        applications = etl.addfield(
            applications, 'typeofpermit',
            lambda v: 'I would like to apply for a Multi-Year, Area Based permit' if v['multi_year_area_ind'] == 1 else ('I would like to apply for a Multi-Year permit' if v['multi_year_ind'] == 1 else None)
        )
        applications = etl.cutout(applications, 'multi_year_area_ind')
        applications = etl.cutout(applications, 'multi_year_ind')

        sand_grv_qry_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, convert_to(recl_desc, "UTF-8") as SandGrvQryReclamation, recl_dol as SandGrvQryReclamationCost, backslope as SandGrvQryReclamationCost, oper1_ind, oper2_ind, oper3_ind, alr_ind as SandGrvQryWithinAgLandRes, srb_ind as SandGrvQryLocalGovSoilRemBylaw, pdist_ar as SANDGRVQRYDISTURBEDAREA, t_vol as SANDGRVQRYTIMBERVOLUME, edist_Ar as SANDGRVQRYTOTALEXISTDISTAREA, act1_ind, act2_ind, act3_ind, act4_ind, act1_ar, act2_ar, act3_ar, act4_ar, act1_vol, act2_vol, act3_vol, act4_vol from mms.mmssci_n'
        )

        sand_grv_qry_activity_app_cols = etl.cut(sand_grv_qry_activity, [
            'mms_cid', 'oper1_ind', 'oper2_ind', 'oper3_ind', 'SandGrvQryReclamation',
            'SandGrvQryReclamationCost', 'SandGrvQryReclamationBackfill',
            'SandGrvQryWithinAgLandRes', 'SandGrvQryLocalGovSoilRemBylaw',
            'SANDGRVQRYTOTALEXISTDISTAREA', 'SANDGRVQRYDISTURBEDAREA', 'SANDGRVQRYTIMBERVOLUME',
        ])

        sand_grv_qry_activity = etl.cutout(sand_grv_qry_activity, [
            'oper1_ind', 'oper2_ind', 'oper3_ind', 'SandGrvQryReclamation',
            'SandGrvQryReclamationCost', 'SandGrvQryReclamationBackfill',
            'SandGrvQryWithinAgLandRes', 'SandGrvQryLocalGovSoilRemBylaw',
            'SANDGRVQRYTOTALEXISTDISTAREA'
        ])
        
        sand_grv_qry_activity_app_cols = etl.addfield(
            sand_grv_qry_activity_app_cols, 'yearroundseasonal',
            lambda v: 'Year Round' if v['oper1_ind'] == 1 else ('Seasonal' if v['oper2_ind'] == 1 else 'Intermittent')
        )

        sand_grv_qry_activity_app_cols = etl.cutout(sand_grv_qry_activity_app_cols,
                                                    ['oper1_ind', 'oper2_ind', 'oper3_ind'])

        sand_grv_qry_activity_detail = etl.fromdb(
            connection,
            f'SELECT * from MMS_NOW_Submissions.sand_grv_qry_activity'
        )
        
        sand_grv_qry_activity_1 = etl.cut(sand_grv_qry_activity, [
            'mms_cid', 'act1_ind', 'act1_ar', 'act1_vol'
        ])

        sand_grv_qry_activity_2 = etl.cut(sand_grv_qry_activity, [
            'mms_cid', 'act2_ind', 'act2_ar', 'act2_vol'
        ])

        sand_grv_qry_activity_3 = etl.cut(sand_grv_qry_activity, [
            'mms_cid', 'act3_ind', 'act3_ar', 'act3_vol'
        ])

        sand_grv_qry_activity_4 = etl.cut(sand_grv_qry_activity, [
            'mms_cid', 'act4_ind', 'act4_ar', 'act4_vol'
        ])

        sand_grv_qry_activity_1 = etl.select(sand_grv_qry_activity_1, lambda v: v['act1_ind'] == 1)
        sand_grv_qry_activity_2 = etl.select(sand_grv_qry_activity_2, lambda v: v['act2_ind'] == 1)
        sand_grv_qry_activity_3 = etl.select(sand_grv_qry_activity_3, lambda v: v['act3_ind'] == 1)
        sand_grv_qry_activity_4 = etl.select(sand_grv_qry_activity_4, lambda v: v['act4_ind'] == 1)
        
    
        sand_grv_qry_activity_1 = etl.addfield(sand_grv_qry_activity_1, 'type','Excavation of Pit Run')
        sand_grv_qry_activity_1 = etl.addfield(sand_grv_qry_activity_1, 'disturbedarea', lambda v: v['act1_ar'])
        sand_grv_qry_activity_1 = etl.addfield(sand_grv_qry_activity_1, 'timbervolume', lambda v: v['act1_vol'])

        sand_grv_qry_activity_1 = etl.cutout(sand_grv_qry_activity_1, ['act1_ind', 'act1_ar', 'act1_vol'])

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_1, key='mms_cid')

    
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'type','Crushing')
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'disturbedarea', lambda v: v['act2_ar'])
        sand_grv_qry_activity_2 = etl.addfield(sand_grv_qry_activity_2, 'timbervolume', lambda v: v['act2_vol'])

        sand_grv_qry_activity_2 = etl.cutout(sand_grv_qry_activity_2, ['act2_ind', 'act2_ar', 'act2_vol'])

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_2, key='mms_cid')

    
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'type','Mechanical Screening')
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'disturbedarea', lambda v: v['act3_ar'])
        sand_grv_qry_activity_3 = etl.addfield(sand_grv_qry_activity_3, 'timbervolume', lambda v: v['act3_vol'])

        sand_grv_qry_activity_3 = etl.cutout(sand_grv_qry_activity_3, ['act3_ind', 'act3_ar', 'act3_vol'])

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_3, key='mms_cid')

    
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'type','Washing')
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'disturbedarea', lambda v: v['act4_ar'])
        sand_grv_qry_activity_4 = etl.addfield(sand_grv_qry_activity_4, 'timbervolume', lambda v: v['act4_vol'])

        sand_grv_qry_activity_4 = etl.cutout(sand_grv_qry_activity_4, ['act4_ind', 'act4_ar', 'act4_vol'])

        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, sand_grv_qry_activity_4, key='mms_cid')
        
        sand_grv_qry_activity_detail = etl.join(sand_grv_qry_activity_detail, message_ids, key='mms_cid')
        applications = etl.outerjoin(applications, sand_grv_qry_activity_app_cols, key='mms_cid')

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
            f'SELECT cid as mms_cid, line_km as CutLinesExplGridTotalLineKms, t_vol as CutLinesExplGridTimberVolume, recl_desc as CutLinesReclamation, recl_dol as CutLinesReclamationCost, t_ar as CutLinesExplGridDisturbedArea from mms.mmssco_n'
        )

        applications = etl.outerjoin(applications, cut_lines, key='mms_cid')

        exploration_access = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as ExpAccessReclamation, recl_dol as ExpAccessReclamationCost, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act7_ind, act1_len, act2_len, act3_len, act4_len, act5_len, act6_len, act7_len, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act7_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol, act7_vol from mms.mmssce_n'
        )

        exploration_access_app_cols = etl.cut(exploration_access, [
            'mms_cid', 'ExpAccessReclamation', 'ExpAccessReclamationCost'
        ])

        exploration_access = etl.cutout(exploration_access, [
            'ExpAccessReclamation', 'ExpAccessReclamationCost'
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
            f'SELECT cid as mms_cid, recl_desc as ExpSurfaceDrillReclamation, recl_dol as ExpSurfaceDrillReclamationCost, storage_desc as ExpSurfaceDrillReclCoreStorage, act1_ind, act2_ind, act3_ind, act4_ind, act5_ind, act6_ind, act7_ind, act8_ind, act1_cnt, act2_cnt, act3_cnt, act4_cnt, act5_cnt, act6_cnt, act7_cnt, act8_cnt, act1_ar, act2_ar, act3_ar, act4_ar, act5_ar, act6_ar, act7_ar, act8_ar, act1_vol, act2_vol, act3_vol, act4_vol, act5_vol, act6_vol, act7_vol, act8_vol from mms.mmsscd_n'
        )

        exploration_surface_drill_app_cols = etl.cut(exploration_surface_drill, [
            'mms_cid', 'ExpSurfaceDrillReclamation', 'ExpSurfaceDrillReclamationCost', 'ExpSurfaceDrillReclCoreStorage'
        ])

        exploration_surface_drill = etl.cutout(exploration_surface_drill, [
            'ExpSurfaceDrillReclamation', 'ExpSurfaceDrillReclamationCost', 'ExpSurfaceDrillReclCoreStorage'
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
            f'SELECT cid as mms_cid, recl_desc as MechTrenchingReclamation, recl_dol as MechTrenchingReclamationCost, material_desc as surfacebulksamplereclsephandl, drainage_desc as surfacebulksamplerecldrainmiti, act1_ind, act2_ind, act1_cnt, act2_cnt, act1_ar, act2_ar, act1_vol, act2_vol from mms.mmsscb_n'
        )

        mech_trenching_app_cols = etl.cut(mech_trenching, [
            'mms_cid', 'MechTrenchingReclamation', 'MechTrenchingReclamationCost'
        ])

        mech_trenching = etl.cutout(mech_trenching, [
            'MechTrenchingReclamation', 'MechTrenchingReclamationCost'
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

        print('-------------------------------------------------------')
        print('application Table')
        print(applications[1])
        print('-------------------------------------------------------')

        under_exp_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, recl_desc as UnderExpReclamation, recl_dol as UnderExpReclamationCost, t_ar as UNDEREXPSURFACETOTALDISTAREA, t_vol as UNDEREXPSURFACETIMBERVOLUME, devr1_ind, devr2_ind, devr3_ind, devr4_ind, devr5_ind, devr6_ind, devr7_ind, devr8_ind, devr1_ct, devr2_ct, devr3_ct, devr4_ct, devr5_ct, devr6_ct, devr7_ct, devr8_ct, devn1_ind, devn2_ind, devn3_ind, devn4_ind, devn5_ind, devn6_ind, devn7_ind, devn8_ind, devn1_ct, devn2_ct, devn3_ct, devn4_ct, devn5_ct, devn6_ct, devn7_ct, devn8_ct, surf1_ind, surf2_ind, surf3_ind, surf4_ind, surf7_ind, surf8_ind, surf9_ind, surf10_ind, surf1_ct, surf2_ct, surf3_ct, surf4_ct, surf7_ct, surf8_ct, surf9_ct, surf10_ct, surf1_ar, surf2_ar, surf3_ar, surf4_ar, surf7_ar, surf8_ar, surf9_ar, surf10_ar, surf1_vol, surf2_vol, surf3_vol, surf4_vol, surf7_vol, surf8_vol, surf9_vol, surf10_vol from mms.mmsscg_n'
        )

        under_exp_activity_app_cols = etl.cut(mech_trenching, [
            'mms_cid', 'UnderExpReclamation', 'UnderExpReclamationCost', 'UNDEREXPSURFACETOTALDISTAREA', 'UNDEREXPSURFACETIMBERVOLUME'
        ])

        under_exp_activity = etl.cutout(mech_trenching, [
            'UnderExpReclamation', 'UnderExpReclamationCost', 'UNDEREXPSURFACETOTALDISTAREA', 'UNDEREXPSURFACETIMBERVOLUME'
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
            f'SELECT cid as mms_cid, act1_ar as CampDisturbedArea, act1_vol as CampTimberVolume, act2_ar as BldgDisturbedArea, act2_vol as BldgTimberVolume, act3_ar as StgeDisturbedArea, act3_vol as StgeTimberVolume, recl_desc as CBSFReclamation, recl_dol as CBSFReclamationCost from mms.mmssca_n'
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
        print('-------------------------------------------------------')
        print('application Table')
        print(applications[1])
        print('-------------------------------------------------------')  
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
        ETL_MMS_NOW_schema(connection, TABLES, 'mms_now_vfcbc', 'VFCBC')
