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
        cursor.execute(f'TRUNCATE TABLE now_submissions.{table} CONTINUE IDENTITY CASCADE;')


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
            f'SELECT cid as mms_cid, recl_desc as SandGrvQryReclamation, recl_dol as SandGrvQryReclamationCost, backslope as SandGrvQryReclamationCost, oper1_ind, oper2_ind, oper3_ind, alr_ind as SandGrvQryWithinAgLandRes, srb_ind as SandGrvQryLocalGovSoilRemBylaw, pdist_ar as SANDGRVQRYDISTURBEDAREA, t_vol as SANDGRVQRYTIMBERVOLUME, edist_Ar as SANDGRVQRYTOTALEXISTDISTAREA, act1_ind, act2_ind, act3_ind, act4_ind, act1_ar, act2_ar, act3_ar, act4_ar, act1_vol, act2_vol, act3_vol, act4_vol from mms.mmssci_n'
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


        sand_grv_qry_activity_app_cols = etl.cutout(sand_grv_qry_activity_app_cols,
                                                    ['oper1_ind', 'oper2_ind', 'oper3_ind'])

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


        sand_grv_qry_activity_app_cols = etl.cutout(sand_grv_qry_activity_app_cols,
                                                    ['oper1_ind', 'oper2_ind', 'oper3_ind'])

        applications = etl.outerjoin(applications, sand_grv_qry_activity_app_cols, key='mms_cid')

        surface_bulk_activity_app_cols = etl.cut(surface_bulk_activity, [
            'mms_cid', 'SurfaceBulkSampleReclamation', 'surfacebulksamplereclcost', 'surfacebulksamplereclsephandl', 'surfacebulksamplerecldrainmiti'
        ])

        surface_bulk_activity = etl.cutout(surface_bulk_activity, [
            'SurfaceBulkSampleReclamation', 'surfacebulksamplereclcost', 'surfacebulksamplereclsephandl', 'surfacebulksamplerecldrainmiti'
        ])

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

        applications = etl.outerjoin(applications, mech_trenching_app_cols, key='mms_cid')

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
        )
        
        first_aid_equipment_on_site, first_aid_cert_level = streamline_application['comm_desc'].split('  ', 2)

        streamline_application = etl.addfield(
            streamline_application, 'FirstAidEquipmentOnsite',
            first_aid_equipment_on_site)
        )

        streamline_application = etl.addfield(
            streamline_application, 'FirstAidCertLevel',
            first_aid_cert_level)
        )

        streamline_application = etl.addfield(
            streamline_application, 'TenureNumbers',
            lambda v: v['ten_nos1'] + v['ten_nos2'])
        )
        
        streamline_application = etl.addfield(
            streamline_application, 'CrownGrantLotNumbers',
            lambda v: v['cg_clms1'] + v['cg_clms2'])
        )

        streamline_application = etl.addfield(
            streamline_application, 'LandLegalDesc',
            lambda v: v['legal_desc1'] + v['legal_desc2'])
        )

        streamline_application = etl.addfield(
            streamline_application, 'LandPrivate',
            lambda v: 'Yes' if v['priv_ind'] == 1 else 'No')
        )

        streamline_application = etl.addfield(
            streamline_application, 'LandCommunityWatershed',
            lambda v: 'Yes' if v['water_ind'] == 1 else 'No')
        )

        streamline_application = etl.addfield(
            streamline_application, 'ArchSitesAffected',
            lambda v: 'Yes' if v['culture_ind'] == 1 else 'No')
        )

        streamline_application = etl.addfield(
            streamline_application, 'FuelLubStoreOnSite',
            lambda v: 'Yes' if v['fuel_ind'] == 1 else 'No')
        )

        streamline_application = etl.addfield(
            streamline_application, 'FuelLubStoreMethodBarrel',
            lambda v: 'Yes' if v['barrel_ind'] == 1 else 'No')
        )

        streamline_application = etl.addfield(
            streamline_application, 'FuelLubStoreMethodBulk',
            lambda v: 'Yes' if v['bulk_ind'] == 1 else 'No')
        )

        streamline_application = etl.cutout(streamline_application, ['comm_desc', 'pmt_typ', 'ten_nos1', 'ten_nos2', 'cg_clms1', 'cg_clms2', 'legal_desc1', 'legal_desc2', 'priv_ind', 'water_ind', 'culture_ind', 'fuel_ind', 'barrel_ind', 'bulk_ind'])

        streamline_application_app_cols = etl.cutout(streamline_application, ['str_dt_seasonal', 'end_dt_seasonal'])
        
        streamline_application = etl.cut(streamline_application, ['mms_cid', 'str_dt_seasonal', 'end_dt_seasonal'])

        applications = etl.outerjoin(applications, streamline_application_app_cols, key='mms_cid')

        water_source_activity = etl.fromdb(
            connection,
            f'SELECT cid as mms_cid, water_nm as sourcewatersupply, activity as type, water_use as useofwater, water_vol as EstimateRateWater, pump_size as PumpSizeInWater, water_intake as LocationWaterIntake from mms.mmsscp_n_d'
        )

        etl.appenddb(
            applications, connection, 'application', schema='mms_now_submissions', commit=False)

        etl.appenddb(sand_grv_qry_activity_detail, connection,
                             'sand_grv_qry_activity', schema='mms_now_submissions', commit=False)

        for app in applications:
            cid = app['cid']

    except Exception as err:
        print(f'ETL Parsing error: {err}')
        raise


def mms_now_submissions_ETL(connection):
    with connection:
        # Removing the data imported from the previous run.
        print('Truncating existing tables...')
        truncate_table(connection, TABLES)

        # Importing the vFCBC NoW submission data.
        print('Beginning vFCBC NoW ETL:')
        ETL_MMS_NOW_schema(connection, TABLES, 'mms_now_vfcbc', 'VFCBC')

        # Importing the NROS NoW submission data.
        print('Beginning NROS NoW ETL:')
        ETL_MMS_NOW_schema(connection, TABLES, 'mms_now_nros', 'NROS')

def _convert_snd_grv_qry_type(row):
    if row['']