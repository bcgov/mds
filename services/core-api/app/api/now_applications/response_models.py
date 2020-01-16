from app.extensions import api
from flask_restplus import fields

from app.api.parties.response_models import PARTY
from app.api.mines.response_models import MINE_DOCUMENT_MODEL

class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None


NOW_APPLICATION_EQUIPMENT = api.model(
    'NOWEquipment',
    {
        'equipment_id':fields.Integer,
        'description':fields.String,
        'quantity':fields.Integer,
        'capacity':fields.String,
    }
)    

NOW_APPLICATION_ACTIVITY_DETAIL_BASE = api.model('NOWApplicationActivityDetailBase',
    {
        'activity_detail_id': fields.Integer,
        'activity_type_description': fields.String,
        'disturbed_area': fields.Fixed,
        'timber_volume': fields.Fixed,
        'number_of_sites': fields.Integer,
        'width': fields.Integer,
        'length'  : fields.Integer,
        'depth': fields.Integer,
        'height': fields.Integer,
        'quantity': fields.Integer,
        'incline': fields.Fixed,
        'incline_unit_type_code': fields.String,
        'cut_line_length' : fields.Integer,
        'water_quantity' : fields.Integer,
        'water_quantity_unit_type_code': fields.String
    }
)


NOW_APPLICATION_ACTIVITY_SUMMARY_BASE = api.model(
    'NOWApplicationActivitySummaryBase', {
        'reclamation_description': fields.String,
        'reclamation_cost': fields.Fixed,
        'total_disturbed_area': fields.Fixed,
        'total_disturbed_area_unit_type_code': fields.String,
        'equipment':fields.List(fields.Nested(NOW_APPLICATION_EQUIPMENT))
    })

NOW_APPLICATION_CAMP = api.inherit(
    'NOWApplicationCamp', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'camp_name': fields.String,
        'camp_number_people': fields.String,
        'camp_number_structures': fields.String,
        'has_fuel_stored': fields.Boolean,
        'has_fuel_stored_in_bulk': fields.Boolean,
        'has_fuel_stored_in_barrels': fields.Boolean,
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))

    })

NOW_APPLICATION_BLASTING_OPERATION = api.inherit(
    'NOWApplicationBlasting', { 
        'has_storage_explosive_on_site': fields.Boolean,
        'explosive_permit_issued': fields.Boolean,
        'explosive_permit_number': fields.String,
        'explosive_permit_expiry_date': Date
    })

NOW_APPLICATION_CUT_LINES = api.inherit(
    'NOWApplicationCutLines',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
       'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
    })

NOW_APPLICATION_EXP_ACCESS = api.inherit(
    'NOWApplicationExplorationAccess',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
       'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
    })

NOW_APPLICATION_EXP_SURFACE_DRILL = api.inherit('NOWApplicationExpSurfaceDrill',
                                                NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
                                                {'reclamation_core_storage': fields.String,
                                                'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
                                                })


NOW_APPLICATION_MECH_TRENCHING = api.inherit(
    'NOWApplicationMechTrenching',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
       'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
    })

NOW_APPLICATION_PLACER_OPS = api.inherit(
    'NOWApplicationPlacerOperations', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'is_underground': fields.Boolean,
        'is_hand_operation': fields.Boolean,
        'reclamation_area': fields.Fixed,
        'reclamation_unit_type_code': fields.String,
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))

    })

NOW_APPLICATION_SAND_AND_GRAVEL = api.inherit(
    'NOWApplicationSandAndGravel',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
        'average_overburden_depth': fields.Fixed,
        'average_top_soil_depth': fields.Fixed,
        'stability_measures_description': fields.String,
        'is_agricultural_land_reserve': fields.Boolean,
        'agri_lnd_rsrv_permit_application_number': fields.String,
        'has_local_soil_removal_bylaw': fields.Boolean,
        'community_plan': fields.String,
        'land_use_zoning': fields.String,
        'proposed_land_use': fields.String,
        'total_mineable_reserves': fields.Integer,
        'total_mineable_reserves_unit_type_code': fields.String,
        'total_annual_extraction': fields.Integer,
        'total_annual_extraction_unit_type_code': fields.String,
        'average_groundwater_depth': fields.Fixed,
        'has_groundwater_from_existing_area': fields.Boolean,
        'has_groundwater_from_test_pits': fields.Boolean,
        'has_groundwater_from_test_wells': fields.Boolean,
        'groundwater_from_other_description': fields.String,
        'groundwater_protection_plan': fields.String,
        'nearest_residence_distance': fields.Integer,
        'nearest_residence_distance_unit_type_code': fields.String,
        'nearest_water_source_distance': fields.Integer,
        'nearest_water_source_distance_unit_type_code': fields.String,
        'noise_impact_plan': fields.String,
        'secure_access_plan': fields.String,
        'dust_impact_plan': fields.String,
        'visual_impact_plan': fields.String,
        'reclamation_backfill_detail': fields.String,
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
        
    })
NOW_APPLICATION_SETTLING_POND_DETAIL = api.inherit(
    'NOWApplicationCampDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE,{
        'water_source_description': fields.String, 
        'construction_plan': fields.String
    }
)

NOW_APPLICATION_SETTLING_POND = api.inherit(
    'NOWApplicationSettlingPond',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
     'proponent_pond_name': fields.String,
     'is_ponds_exfiltrated': fields.Boolean,
     'is_ponds_recycled': fields.Boolean,
     'is_ponds_discharged': fields.Boolean,
     'details': fields.List(fields.Nested(NOW_APPLICATION_SETTLING_POND_DETAIL,skip_none=True))
    })

NOW_APPLICATION_SURFACE_BULK = api.inherit(
    'NOWApplicationSurfaceBulkSample',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
        'processing_method_description': fields.String,
        'handling_instructions': fields.String,
        'drainage_mitigation_description': fields.String,
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))

    })

NOW_APPLICATION_UNDERGROUND_EXPLORATION_DETAIL = api.inherit(
    'NOWApplicationCampDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE,{
        'underground_exploration_type_code': fields.String, 
    }
)

NOW_APPLICATION_UNDERGROUND_EXPLORATION = api.inherit(
    'NOWApplicationUndergroundExploration',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
    })

NOW_APPLICATION_WATER_SUPPLY_DETAIL = api.inherit(
    'NOWApplicationWaterSupplyDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE,{
        'supply_source_description': fields.String, 
        'supply_source_type': fields.String, 
        'water_use_description': fields.String, 
        'estimate_rate': fields.Fixed,
        'pump_size': fields.Fixed,
        'intake_location': fields.String
    }
)

NOW_APPLICATION_WATER_SUPPLY = api.inherit(
    'NOWApplicationWaterSupply',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
        'details': fields.List(fields.Nested(NOW_APPLICATION_WATER_SUPPLY_DETAIL,skip_none=True))
    })

NOW_APPLICATION_STATE_OF_LAND = api.model(
    'NOWStateOfLand',
    {
        'has_community_water_shed': fields.Boolean,
        'has_archaeology_sites_affected': fields.Boolean
    }
)

NOW_APPLICATION_DOCUMENT = api.model(
    'NOW_DOCUMENT', {
        'now_application_document_xref_guid': fields.String,
        'now_application_document_type_code': fields.String,
        'description': fields.String,
        'is_final_package': fields.Boolean,
        'mine_document': fields.Nested(MINE_DOCUMENT_MODEL),
    }
)

NOW_APPLICATION_PROGRESS = api.model(
    'NOWApplicationProgress',
    {
        'start_date': fields.Date,
        'created_by': fields.String,
        'application_progress_status_code': fields.String
    })
    
NOW_APPLICATION_REVIEW_MDOEL = api.model(
    'NOWApplicationReview',
    {
        'now_application_review_id':fields.Integer, 
        'now_application_guid':fields.String(attribute='now_application.now_application_guid'),
        'now_application_review_type_code':fields.String, 
        'response_date':fields.Date, 
        'referee_name':fields.String,
        'documents':fields.List(fields.Nested(NOW_APPLICATION_DOCUMENT))
    }
)

NOW_SUBMISSION_DOCUMENT = api.model(
    'SUBMISSION_DOCUMENT', {
        'id': fields.Integer,
        'documenturl': fields.String,
        'filename': fields.String,
        'documenttype': fields.String,
        'description': fields.String,
    })

NOW_PARTY_APPOINTMENT = api.model(
    'NOW_PARTY_APPOINTMENT', {
        'now_party_appointment_id': fields.Integer,
        'mine_party_appt_type_code': fields.String,
        'mine_party_appt_type_code_description': fields.String,
        'party': fields.Nested(PARTY),
    }
)

NOW_APPLICATION_MODEL = api.model(
    'NOWApplication',
    {
        'now_application_guid': fields.String,
        'now_number': fields.String,
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_region': fields.String,
        'lead_inspector_party_guid': fields.String,
        'lead_inspector': fields.Nested(PARTY),
        'imported_to_core' : fields.Boolean, #Just-in-time attribute
        'notice_of_work_type_code': fields.String,                  
        'now_application_status_code': fields.String,               
        'submitted_date': Date,
        'received_date': Date,
        'latitude': fields.Fixed(description='fixed precision decimal.',
                                 decimals=7),
        'longitude': fields.Fixed(description='fixed precision decimal.',
                                  decimals=7),
        'property_name': fields.String,
        'tenure_number': fields.String,
        'description_of_land': fields.String,
        'application_permit_type_code': fields.String,
        'proposed_start_date': Date,
        'proposed_end_date': Date,
        'directions_to_site':fields.String,
        'application_progress': fields.Nested(NOW_APPLICATION_PROGRESS,skip_none=True),
        'state_of_land': fields.Nested(NOW_APPLICATION_STATE_OF_LAND,skip_none=True),
        'first_aid_equipment_on_site': fields.String,
        'first_aid_cert_level': fields.String, 
        'blasting_operation': fields.Nested(NOW_APPLICATION_BLASTING_OPERATION, skip_none=True),
        'camps': fields.Nested(NOW_APPLICATION_CAMP, skip_none=True),
        'cut_lines_polarization_survey': fields.Nested(NOW_APPLICATION_CUT_LINES, skip_none=True),
        'exploration_access': fields.Nested(NOW_APPLICATION_EXP_ACCESS, skip_none=True),
        'exploration_surface_drilling': fields.Nested(NOW_APPLICATION_EXP_SURFACE_DRILL, skip_none=True),
        'mechanical_trenching': fields.Nested(NOW_APPLICATION_MECH_TRENCHING, skip_none=True),
        'placer_operation': fields.Nested(NOW_APPLICATION_PLACER_OPS, skip_none=True),
        'sand_and_gravel': fields.Nested(NOW_APPLICATION_SAND_AND_GRAVEL, skip_none=True),
        'settling_pond': fields.Nested(NOW_APPLICATION_SETTLING_POND, skip_none=True),
        'surface_bulk_sample': fields.Nested(NOW_APPLICATION_SURFACE_BULK, skip_none=True),
        'underground_exploration': fields.Nested(NOW_APPLICATION_UNDERGROUND_EXPLORATION, skip_none=True),
        'water_supply': fields.Nested(NOW_APPLICATION_WATER_SUPPLY, skip_none=True),
        'documents': fields.List(fields.Nested(NOW_APPLICATION_DOCUMENT), skip_none=True),
        'submission_documents': fields.List(fields.Nested(NOW_SUBMISSION_DOCUMENT), skip_none=True),
        'contacts': fields.List(fields.Nested(NOW_PARTY_APPOINTMENT), skip_none=True),
        'ready_for_review_date': Date,
        'referral_closed_on_date': Date,
        'consultation_closed_on_date': Date,
        'public_comment_closed_on_date': Date
    })

NOW_VIEW_MODEL = api.model(
    'NOWApplication',
    {
        'now_application_guid': fields.String,
        'mine_guid': fields.String,
        'mine_no': fields.String,
        'mine_name':fields.String,
        'mine_region':fields.String,
        'now_number': fields.String,
        'lead_inspector_party_guid': fields.String,
        'lead_inspector_name': fields.String,
        'notice_of_work_type_description': fields.String,
        'now_application_status_description': fields.String,
        'received_date': Date,
        'originating_system': fields.String,
    }
)
 
PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

NOW_VIEW_LIST = api.inherit('NOWApplicationList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(NOW_VIEW_MODEL)),
    })

NOW_ACTIVITY_TYPES = api.model(
    'ActivityType', 
    {
        'activity_type_code': fields.String,
        'description': fields.String
    }
)

NOW_APPLICATION_TYPES = api.model(
    'ApplicationType', 
    {
        'notice_of_work_type_code': fields.String,
        'description': fields.String
    }
)

NOW_APPLICATION_STATUS_CODES = api.model(
    'ActivityStatusCodes', 
    {
        'now_application_status_code': fields.String,
        'description': fields.String
    }
)


UNIT_TYPES = api.model(
    'UnitTypeCodes', 
    {
        'unit_type_code': fields.String,
        'description': fields.String
    }
)

NOW_APPLICATION_DOCUMENT_TYPES = api.model(
    'ApplicationDocumentTypes', 
    {
        'now_application_document_type_code': fields.String,
        'description': fields.String
    }
)

UNDERGROUND_EXPLORATION_TYPES = api.model(
    'UndergroundExplorationTypes', 
    {
        'underground_exploration_type_code': fields.String,
        'description': fields.String
    }
)

APPLICATION_PROGRESS_STATUS_CODES = api.model(
    'ApplicationProgressStatusCodes',
    {
        'application_progress_status_code': fields.String,
        'description': fields.String
    }
)

NOW_APPLICATION_PERMIT_TYPES = api.model(
    'ApplicationPermitTypes', 
    {
        'now_application_permit_type_code': fields.String,
        'description': fields.String
    }
)
NOW_APPLICATION_REVIEW_TYPES= api.model(
    'ApplicationReviewTypes', 
    {
        'now_application_review_type_code': fields.String,
        'description': fields.String
    } 
)