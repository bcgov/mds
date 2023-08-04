import re
from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models
from app.api.mms_now_submissions import models as mms_sub_models
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.address import Address
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.constants import type_of_permit_map, unit_type_map

from flask import current_app

vfcbc_status_code_mapping = {
    "Accepted": "AIA",
    "Approved": "AIA",
    "Withdrawn": "WDN",
    "Rejected": "RJN",
    "Rejected-Initial": "RJN",
    "Under Review": "PEV",
    "Pending Verification": "PEV",
    "Client Delayed": "PEV",
    "Govt. Action Required": "PEV",
    "Referral Complete": "PEV",
    "Referred": "PEV",
    "No Permit Required": "PEV",
    None: "PEV",
}


def code_lookup(model, description, code_column_name):
    if description:
        row = model.query.filter_by(description=description).first()
        if not row:
            raise Exception(
                f'Code description "{description}" not found on table "{model.__name__}"')
        result = getattr(row, code_column_name)
    else:
        result = None
    return result


def get_boolean_value(field):
    result = field
    if field is not None:
        result = field == 'Yes'
    return result


def transmogrify_now(now_application_identity, include_contacts=False):
    now_sub = sub_models.Application.find_by_messageid(
        now_application_identity.messageid) or sub_models.Application()
    mms_now_sub = mms_sub_models.MMSApplication.find_by_mms_cid(
        now_application_identity.mms_cid) or mms_sub_models.MMSApplication()

    now_app = app_models.NOWApplication(now_application_identity=now_application_identity)

    _transmogrify_now_details(now_app, now_sub, mms_now_sub)
    _transmogrify_blasting_activities(now_app, now_sub, mms_now_sub)
    _transmogrify_state_of_land(now_app, now_sub, mms_now_sub)

    if include_contacts == True:
        _transmogrify_contacts(now_app, now_sub, mms_now_sub)
        _transmogrify_clients(now_app, now_sub, mms_now_sub)

    #Activities
    _transmogrify_camp_activities(now_app, now_sub, mms_now_sub)
    _transmogrify_exploration_access(now_app, now_sub, mms_now_sub)
    _transmogrify_cut_lines_polarization_survey(now_app, now_sub, mms_now_sub)
    _transmogrify_exploration_surface_drilling(now_app, now_sub, mms_now_sub)
    _transmogrify_mechanical_trenching(now_app, now_sub, mms_now_sub)
    _transmogrify_placer_operations(now_app, now_sub, mms_now_sub)
    _transmogrify_sand_gravel_quarry_operations_activities(now_app, now_sub, mms_now_sub)
    _transmogrify_settling_ponds(now_app, now_sub, mms_now_sub)
    _transmogrify_surface_bulk_sample(now_app, now_sub, mms_now_sub)
    _transmogrify_underground_exploration(now_app, now_sub, mms_now_sub)
    _transmogrify_water_supply(now_app, now_sub, mms_now_sub)

    #Equipment
    for e in now_sub.equipment:
        equipment = _transmogrify_equipment(e)
        now_app.equipment.append(equipment)

    return now_app


def _transmogrify_now_details(now_app, now_sub, mms_now_sub):
    now_app.now_tracking_number = now_sub.trackingnumber
    now_app.notice_of_work_type_code = code_lookup(
        app_models.NOWApplicationType, mms_now_sub.noticeofworktype or now_sub.noticeofworktype,
        'notice_of_work_type_code')
    # TODO: Determine if we should always set the code the PEV (Pending Verifiation) here.
    status = mms_now_sub.status or now_sub.status
    now_app.now_application_status_code = vfcbc_status_code_mapping[status]

    now_app.application_permit_type_code = type_of_permit_map[now_sub.typeofpermit]

    now_app.submitted_date = mms_now_sub.submitteddate or now_sub.submitteddate
    now_app.received_date = mms_now_sub.receiveddate or now_sub.receiveddate
    now_app.latitude = mms_now_sub.latitude or now_sub.latitude
    now_app.longitude = mms_now_sub.longitude or now_sub.longitude
    now_app.gate_latitude = now_sub.gatelatitude
    now_app.gate_longitude = now_sub.gatelongitude
    now_app.property_name = mms_now_sub.nameofproperty or now_sub.nameofproperty
    now_app.tenure_number = mms_now_sub.tenurenumbers or now_sub.tenurenumbers
    now_app.crown_grant_or_district_lot_numbers = mms_now_sub.crowngrantlotnumbers or now_sub.crowngrantlotnumbers
    now_app.type_of_application = mms_now_sub.typeofapplication or now_sub.typeofapplication
    now_app.proposed_start_date = mms_now_sub.proposedstartdate or now_sub.proposedstartdate
    now_app.proposed_end_date = mms_now_sub.proposedenddate or now_sub.proposedenddate
    now_app.directions_to_site = mms_now_sub.sitedirections or now_sub.sitedirections
    now_app.first_aid_equipment_on_site = mms_now_sub.firstaidequipmentonsite or now_sub.firstaidequipmentonsite
    now_app.first_aid_cert_level = mms_now_sub.firstaidcertlevel or now_sub.firstaidcertlevel
    now_app.submission_documents = now_sub.documents

    now_app.is_applicant_individual_or_company = now_sub.applicantindividualorcompany
    now_app.relationship_to_applicant = now_sub.applicantrelationship
    now_app.term_of_application = now_sub.termofapplication
    now_app.has_req_access_authorizations = get_boolean_value(now_sub.hasaccessauthorizations)
    now_app.req_access_authorization_numbers = now_sub.accessauthorizationsdetails
    now_app.has_key_for_inspector = get_boolean_value(now_sub.accessauthorizationskeyprovided)
    now_app.work_plan = now_sub.descexplorationprogram
    now_app.merchantable_timber_volume = now_sub.timbertotalvolume
    now_app.proposed_annual_maximum_tonnage = now_sub.maxannualtonnage
    now_app.adjusted_annual_maximum_tonnage = now_sub.maxannualtonnage
    now_app.is_access_gated = get_boolean_value(now_sub.isaccessgated)
    now_app.has_surface_disturbance_outside_tenure = get_boolean_value(
        now_sub.hassurfacedisturbanceoutsidetenure)

    now_app.is_pre_launch = now_sub.is_pre_launch
    now_app.proponent_submitted_permit_number = now_sub.permitnumber
    now_app.annual_summary_submitted = get_boolean_value(now_sub.annualsummarysubmitted)
    now_app.is_first_year_of_multi = get_boolean_value(now_sub.firstyearofmulti)
    now_app.ats_authorization_number = now_sub.atsauthorizationnumber
    now_app.ats_project_number = now_sub.atsprojectnumber
    now_app.original_start_date = now_sub.originalstartdate
    now_app.other_information = now_sub.anyotherinformation
    now_app.unreclaimed_disturbance_previous_year = now_sub.reclareaexist
    now_app.disturbance_planned_reclamation = now_sub.reclarearecl

    return


def _transmogrify_state_of_land(now_app, now_sub, mms_now_sub):
    landcommunitywatershed = mms_now_sub.landcommunitywatershed or now_sub.landcommunitywatershed
    archsitesaffected = mms_now_sub.archsitesaffected or now_sub.hasarchaeologicalprotectionplan
    present_land_condition_description = now_sub.landpresentcondition
    means_of_access_description = now_sub.currentmeansofaccess
    physiography_description = now_sub.physiography
    old_equipment_description = now_sub.oldequipment
    type_of_vegetation_description = now_sub.typeofvegetation
    recreational_trail_use_description = now_sub.recreationuse
    has_activity_in_park = get_boolean_value(now_sub.isparkactivities)
    is_on_private_land = get_boolean_value(now_sub.isonprivateland)
    is_on_crown_land = get_boolean_value(now_sub.oncrownland)
    has_auth_lieutenant_gov_council = get_boolean_value(now_sub.hasltgovauthorization)
    arch_site_protection_plan = now_sub.archaeologicalprotectionplan
    has_shared_info_with_fn = get_boolean_value(now_sub.hasengagedfirstnations)
    has_acknowledged_undrip = get_boolean_value(now_sub.hasacknowledgedundrip)
    has_fn_cultural_heritage_sites_in_area = get_boolean_value(now_sub.hasculturalheritageresources)
    fn_engagement_activities = now_sub.firstnationsactivities
    cultural_heritage_description = now_sub.curturalheritageresources
    havelicenceofoccupation = now_sub.havelicenceofoccupation
    appliedforlicenceofoccupation = now_sub.appliedforlicenceofoccupation
    authorizationdetail = now_sub.authorizationdetail
    licenceofoccupation = now_sub.licenceofoccupation
    noticeservedtoprivate = now_sub.noticeservedtoprivate
    file_number_of_app = now_sub.filenumberofappl
    landlegaldesc = now_sub.landlegaldesc

    if landcommunitywatershed or archsitesaffected or present_land_condition_description or means_of_access_description or physiography_description or old_equipment_description or type_of_vegetation_description or recreational_trail_use_description or has_activity_in_park or has_auth_lieutenant_gov_council or arch_site_protection_plan or has_shared_info_with_fn or has_acknowledged_undrip or has_fn_cultural_heritage_sites_in_area or fn_engagement_activities or cultural_heritage_description or is_on_private_land:
        now_app.state_of_land = app_models.StateOfLand(
            has_community_water_shed=get_boolean_value(landcommunitywatershed),
            has_archaeology_sites_affected=get_boolean_value(archsitesaffected),
            present_land_condition_description=present_land_condition_description,
            means_of_access_description=means_of_access_description,
            physiography_description=physiography_description,
            old_equipment_description=old_equipment_description,
            type_of_vegetation_description=type_of_vegetation_description,
            recreational_trail_use_description=recreational_trail_use_description,
            has_activity_in_park=has_activity_in_park,
            is_on_private_land=is_on_private_land,
            is_on_crown_land=is_on_crown_land,
            has_auth_lieutenant_gov_council=has_auth_lieutenant_gov_council,
            arch_site_protection_plan=arch_site_protection_plan,
            has_shared_info_with_fn=has_shared_info_with_fn,
            has_acknowledged_undrip=has_acknowledged_undrip,
            has_fn_cultural_heritage_sites_in_area=has_fn_cultural_heritage_sites_in_area,
            fn_engagement_activities=fn_engagement_activities,
            cultural_heritage_description=cultural_heritage_description,
            authorization_details=authorizationdetail,
            has_licence_of_occupation=get_boolean_value(havelicenceofoccupation),
            licence_of_occupation=licenceofoccupation,
            file_number_of_app=file_number_of_app,
            legal_description_land=landlegaldesc,
            applied_for_licence_of_occupation=get_boolean_value(appliedforlicenceofoccupation),
            notice_served_to_private=get_boolean_value(noticeservedtoprivate))

    return


def _map_contact_type(submission_type):
    if submission_type == 'Mine manager': return 'MMG'
    if submission_type == 'Permittee': return 'PMT'
    if submission_type == 'Site operator': return 'MOR'
    if submission_type == 'Tenure Holder': return 'THD'
    raise Exception(submission_type + ' is not a valid contact type')


def _transmogrify_contacts(now_app, now_sub, mms_now_sub):
    for c in now_sub.contacts:
        emailValidator = re.compile(r'[^@]+@[^@]+\.[^@]+')
        now_party_appt = None
        if c.type == 'Individual' and c.contacttype and c.ind_lastname and c.ind_firstname:
            now_party = Party(
                party_name=c.ind_lastname,
                first_name=c.ind_firstname,
                party_type_code='PER',
                phone_no=None if c.ind_phonenumber is None else c.ind_phonenumber[:3] + "-" +
                c.ind_phonenumber[3:6] + "-" + c.ind_phonenumber[6:],
                email=c.email if c.email and emailValidator.match(c.email) else None,
            )
            now_party_mine_party_appt_type = MinePartyAppointmentType.find_by_mine_party_appt_type_code(
                _map_contact_type(c.contacttype))
            now_party_appt = app_models.NOWPartyAppointment(
                mine_party_appt_type_code=now_party_mine_party_appt_type.mine_party_appt_type_code,
                mine_party_appt_type=now_party_mine_party_appt_type,
                party=now_party)
        if c.type == 'Organization' and c.contacttype and c.org_legalname and c.dayphonenumber:
            now_party = Party(
                party_name=c.org_legalname,
                party_type_code='ORG',
                phone_no=None if c.dayphonenumber is None else c.dayphonenumber[:3] + "-" +
                c.dayphonenumber[3:6] + "-" + c.dayphonenumber[6:],
                phone_ext=c.dayphonenumberext,
                email=c.email if c.email and emailValidator.match(c.email) else None,
            )
            now_party_mine_party_appt_type = MinePartyAppointmentType.find_by_mine_party_appt_type_code(
                _map_contact_type(c.contacttype))
            now_party_appt = app_models.NOWPartyAppointment(
                mine_party_appt_type_code=now_party_mine_party_appt_type.mine_party_appt_type_code,
                mine_party_appt_type=now_party_mine_party_appt_type,
                party=now_party)

        if now_party_appt:
            validPostalCode = re.compile(r"\s*([a-zA-Z]\s*\d\s*){3}$")
            post_code = c.mailingaddresspostalzip.replace(
                " ", "") if c.mailingaddresspostalzip and validPostalCode.match(
                    c.mailingaddresspostalzip.replace(" ", "")) else None
            if c.mailingaddressline1 or c.mailingaddresscity or c.mailingaddressprovstate:
                now_address = Address(
                    address_line_1=c.mailingaddressline1,
                    address_line_2=c.mailingaddressline2,
                    city=c.mailingaddresscity,
                    sub_division_code=c.mailingaddressprovstate.replace(" ", ""),
                    post_code=post_code,
                    address_type_code='CAN' if c.mailingaddresscountry == 'Canada' else 'USA')
                now_party_appt.party.address.append(now_address)
            now_app.contacts.append(now_party_appt)
    return


def _transmogrify_clients(now_app, now_sub, mms_now_sub):
    agent = now_sub.submitter
    if not agent:
        return

    emailValidator = re.compile(r'[^@]+@[^@]+\.[^@]+')
    now_party_appt = None
    if agent.type == 'Individual' and agent.ind_lastname and agent.ind_firstname and agent.ind_phonenumber:
        now_party = Party(
            party_name=agent.ind_lastname,
            first_name=agent.ind_firstname,
            party_type_code='PER',
            phone_no=agent.ind_phonenumber[:3] + "-" + agent.ind_phonenumber[3:6] + "-" +
            agent.ind_phonenumber[6:],
            email=agent.email if agent.email and emailValidator.match(agent.email) else None,
        )
        now_party_appt_type = MinePartyAppointmentType.find_by_mine_party_appt_type_code('AGT')
        now_party_appt = app_models.NOWPartyAppointment(
            mine_party_appt_type_code=now_party_appt_type.mine_party_appt_type_code,
            mine_party_appt_type=now_party_appt_type,
            party=now_party)
    if agent.type == 'Organization' and agent.org_legalname and agent.dayphonenumber:
        now_party = Party(
            party_name=agent.org_legalname,
            party_type_code='ORG',
            phone_no=agent.dayphonenumber[:3] + "-" + agent.dayphonenumber[3:6] + "-" +
            agent.dayphonenumber[6:],
            phone_ext=agent.dayphonenumberext,
            email=agent.email if agent.email and emailValidator.match(agent.email) else None,
        )
        now_party_appt_type = MinePartyAppointmentType.find_by_mine_party_appt_type_code('AGT')
        now_party_appt = app_models.NOWPartyAppointment(
            mine_party_appt_type_code=now_party_appt_type.mine_party_appt_type_code,
            mine_party_appt_type=now_party_appt_type,
            party=now_party)

    if now_party_appt:
        validPostalCode = re.compile(r"\s*([a-zA-Z]\s*\d\s*){3}$")
        post_code = agent.mailingaddresspostalzip.replace(
            " ", "") if agent.mailingaddresspostalzip and validPostalCode.match(
                agent.mailingaddresspostalzip.replace(" ", "")) else None
        if agent.mailingaddressline1 and agent.mailingaddresscity and agent.mailingaddressprovstate and agent.mailingaddresscountry:
            now_address = Address(
                address_line_1=agent.mailingaddressline1,
                address_line_2=agent.mailingaddressline2,
                city=agent.mailingaddresscity,
                sub_division_code=agent.mailingaddressprovstate.replace(" ", ""),
                post_code=post_code,
                address_type_code='CAN' if agent.mailingaddresscountry == 'Canada' else 'USA')
            now_party_appt.party.address.append(now_address)
        now_app.contacts.append(now_party_appt)
    return


#Activities
def _transmogrify_camp_activities(now_app, now_sub, mms_now_sub):
    cbsfreclamation = mms_now_sub.cbsfreclamation or now_sub.cbsfreclamation
    cbsfreclamationcost = mms_now_sub.cbsfreclamationcost or now_sub.cbsfreclamationcost
    campbuildstgetotaldistarea = now_sub.campbuildstgetotaldistarea
    fuellubstoremethodbulk = now_sub.fuellubstoremethodbulk
    fuellubstoremethodbarrel = now_sub.fuellubstoremethodbarrel
    fuellubstored = now_sub.fuellubstored
    camphealthauthority = now_sub.camphealthauthority
    camphealthconsent = now_sub.camphealthconsent

    fuellubstoreonsite = mms_now_sub.fuellubstoreonsite or now_sub.fuellubstoreonsite
    if cbsfreclamation or cbsfreclamationcost or campbuildstgetotaldistarea or fuellubstoreonsite:

        camp = app_models.Camp(
            reclamation_description=cbsfreclamation,
            reclamation_cost=cbsfreclamationcost,
            total_disturbed_area=campbuildstgetotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            health_authority_consent=get_boolean_value(camphealthconsent),
            health_authority_notified=get_boolean_value(camphealthauthority),
            has_fuel_stored=get_boolean_value(fuellubstoreonsite),
            has_fuel_stored_in_bulk=get_boolean_value(fuellubstoremethodbulk),
            volume_fuel_stored=fuellubstored,
            has_fuel_stored_in_barrels=get_boolean_value(fuellubstoremethodbarrel))

        campdisturbedarea = mms_now_sub.campdisturbedarea or now_sub.campdisturbedarea
        camptimbervolume = mms_now_sub.camptimbervolume or now_sub.camptimbervolume
        for detail in now_sub.camps:
            camp_detail = app_models.CampDetail(
                activity_type_description=detail.name,
                number_people=detail.peopleincamp,
                number_structures=detail.numberofstructures,
                description_of_structures=detail.descriptionofstructures,
                waste_disposal=detail.wastedisposal,
                sanitary_facilities=detail.sanitaryfacilities,
                water_supply=detail.watersupply,
                quantity=detail.quantityofwater,
                disturbed_area=detail.disturbedarea,
                timber_volume=detail.timbervolume)
            camp.details.append(camp_detail)

        bldgdisturbedarea = mms_now_sub.bldgdisturbedarea or now_sub.bldgdisturbedarea
        bldgtimbervolume = mms_now_sub.bldgtimbervolume or now_sub.bldgtimbervolume
        for detail in now_sub.buildings:
            building_detail = app_models.BuildingDetail(
                activity_type_description=detail.name,
                purpose=detail.purpose,
                structure=detail.structure,
                disturbed_area=detail.disturbedarea,
                timber_volume=detail.timbervolume)
            camp.building_details.append(building_detail)

        stgedisturbedarea = mms_now_sub.stgedisturbedarea or now_sub.stgedisturbedarea
        stgetimbervolume = mms_now_sub.stgetimbervolume or now_sub.stgetimbervolume
        for detail in now_sub.stagingareas:
            staging_area_detail = app_models.StagingAreaDetail(
                activity_type_description=detail.name,
                disturbed_area=detail.disturbedarea,
                timber_volume=detail.timbervolume)
            camp.staging_area_details.append(staging_area_detail)

        now_app.camp = camp

    return


def _transmogrify_cut_lines_polarization_survey(now_app, now_sub, mms_now_sub):
    cutlinesreclamation = mms_now_sub.cutlinesreclamation or now_sub.cutlinesreclamation
    cutlinesreclamationcost = mms_now_sub.cutlinesreclamationcost or now_sub.cutlinesreclamationcost
    cutlinesexplgriddisturbedarea = mms_now_sub.cutlinesexplgriddisturbedarea or now_sub.cutlinesexplgriddisturbedarea
    cutlinesexplgridtotallinekms = mms_now_sub.cutlinesexplgridtotallinekms or now_sub.cutlinesexplgridtotallinekms
    cutlinesexplgridtimbervolume = mms_now_sub.cutlinesexplgridtimbervolume or now_sub.cutlinesexplgridtimbervolume
    cutlinesexplgriddisturbedarea = now_sub.cutlinesexplgriddisturbedarea
    if cutlinesreclamation or cutlinesreclamationcost or cutlinesexplgriddisturbedarea:

        clps = app_models.CutLinesPolarizationSurvey(
            reclamation_description=cutlinesreclamation,
            reclamation_cost=cutlinesreclamationcost,
            total_disturbed_area=cutlinesexplgriddisturbedarea,
            total_disturbed_area_unit_type_code='HA')

        if cutlinesexplgridtotallinekms or cutlinesexplgridtimbervolume:
            clps_detial = app_models.CutLinesPolarizationSurveyDetail(
                cut_line_length=cutlinesexplgridtotallinekms,
                disturbed_area=cutlinesexplgriddisturbedarea,
                timber_volume=cutlinesexplgridtimbervolume)
            clps.details.append(clps_detial)

        now_app.cut_lines_polarization_survey = clps

    return


def _transmogrify_exploration_surface_drilling(now_app, now_sub, mms_now_sub):
    expsurfacedrillreclcorestorage = mms_now_sub.expsurfacedrillreclcorestorage or now_sub.expsurfacedrillreclcorestorage
    expsurfacedrillreclamation = mms_now_sub.expsurfacedrillreclamation or now_sub.expsurfacedrillreclamation
    expsurfacedrillreclamationcost = mms_now_sub.expsurfacedrillreclamationcost or now_sub.expsurfacedrillreclamationcost
    expsurfacedrilltotaldistarea = now_sub.expsurfacedrilltotaldistarea
    expsurfacedrillprogam = now_sub.expsurfacedrillprogam
    if expsurfacedrillreclcorestorage or expsurfacedrillreclamation or expsurfacedrillreclamationcost or expsurfacedrilltotaldistarea:
        esd = app_models.ExplorationSurfaceDrilling(
            reclamation_description=expsurfacedrillreclamation,
            reclamation_cost=expsurfacedrillreclamationcost,
            total_disturbed_area=expsurfacedrilltotaldistarea,
            reclamation_core_storage=expsurfacedrillreclcorestorage,
            drill_program=expsurfacedrillprogam,
            total_disturbed_area_unit_type_code='HA')

        if (len(mms_now_sub.exp_surface_drill_activity) > 0):
            exp_surface_drill_activity = mms_now_sub.exp_surface_drill_activity
        else:
            exp_surface_drill_activity = now_sub.exp_surface_drill_activity

        for sd in exp_surface_drill_activity:
            esd_detail = app_models.ExplorationSurfaceDrillingDetail(
                activity_type_description=sd.type,
                number_of_sites=getattr(sd, 'numberofsites', None),
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume)
            esd.details.append(esd_detail)

        now_app.exploration_surface_drilling = esd
    return


def _transmogrify_mechanical_trenching(now_app, now_sub, mms_now_sub):
    mechtrenchingreclamation = mms_now_sub.mechtrenchingreclamation or now_sub.mechtrenchingreclamation
    mechtrenchingreclamationcost = mms_now_sub.mechtrenchingreclamationcost or now_sub.mechtrenchingreclamationcost
    mechtrenchingtotaldistarea = now_sub.mechtrenchingtotaldistarea
    if mechtrenchingreclamation or mechtrenchingreclamationcost or mechtrenchingtotaldistarea:
        mech = app_models.MechanicalTrenching(
            reclamation_description=mechtrenchingreclamation,
            reclamation_cost=mechtrenchingreclamationcost,
            total_disturbed_area=mechtrenchingtotaldistarea,
            total_disturbed_area_unit_type_code='HA')

        if (len(mms_now_sub.mech_trenching_activity) > 0):
            mech_trenching_activity = mms_now_sub.mech_trenching_activity
        else:
            mech_trenching_activity = now_sub.mech_trenching_activity

        for sd in mech_trenching_activity:
            mech_detail = app_models.MechanicalTrenchingDetail(
                activity_type_description=sd.type,
                number_of_sites=sd.numberofsites,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume,
                width=getattr(sd, 'width', None),
                length=getattr(sd, 'length', None),
                depth=getattr(sd, 'depth', None))
            mech.details.append(mech_detail)

        for e in now_sub.mech_trenching_equip:
            equipment = _transmogrify_equipment(e)
            now_app.equipment.append(equipment)

        now_app.mechanical_trenching = mech
    return


def _transmogrify_equipment(e):
    existing_etl = app_models.ETLEquipment.query.filter_by(equipmentid=e.equipmentid).first()
    if existing_etl:
        return existing_etl.equipment

    equipment = app_models.Equipment(description=e.type, quantity=e.quantity, capacity=e.size)
    etl_equipment = app_models.ETLEquipment(equipmentid=e.equipmentid)
    equipment._etl_equipment.append(etl_equipment)

    return equipment


def _transmogrify_exploration_access(now_app, now_sub, mms_now_sub):
    expaccessreclamation = mms_now_sub.expaccessreclamation or now_sub.expaccessreclamation
    expaccessreclamationcost = mms_now_sub.expaccessreclamationcost or now_sub.expaccessreclamationcost
    expaccesstotaldistarea = now_sub.expaccesstotaldistarea
    hasproposedcrossings = now_sub.hasproposedcrossings
    proposedcrossingschanges = now_sub.proposedcrossingschanges

    if expaccessreclamation or expaccessreclamationcost or expaccesstotaldistarea or hasproposedcrossings or proposedcrossingschanges:
        exploration_access = app_models.ExplorationAccess(
            reclamation_description=expaccessreclamation,
            reclamation_cost=expaccessreclamationcost,
            has_proposed_bridges_or_culverts=get_boolean_value(hasproposedcrossings),
            bridge_culvert_crossing_description=proposedcrossingschanges,
            total_disturbed_area=expaccesstotaldistarea,
            total_disturbed_area_unit_type_code='HA')

        now_app.exploration_access = exploration_access

        if (len(mms_now_sub.exp_access_activity) > 0):
            exp_access_activity = mms_now_sub.exp_access_activity
        else:
            exp_access_activity = now_sub.exp_access_activity

        for detail in exp_access_activity:
            now_app.exploration_access.details.append(
                app_models.ExplorationAccessDetail(
                    activity_type_description=detail.type,
                    length=detail.length,
                    disturbed_area=detail.disturbedarea,
                    timber_volume=detail.timbervolume,
                    number_of_sites=getattr(detail, 'numberofsites', None),
                ))


def _transmogrify_placer_operations(now_app, now_sub, mms_now_sub):
    placerundergroundoperations = now_sub.placerundergroundoperations
    placerhandoperations = now_sub.placerhandoperations
    placerreclamationarea = now_sub.placerreclamationarea
    placertotaldistarea = now_sub.placertotaldistarea
    placerreclamation = mms_now_sub.placerreclamation or now_sub.placerreclamation
    placerreclamationcost = mms_now_sub.placerreclamationcost or now_sub.placerreclamationcost
    expaccesstotaldistarea = now_sub.expaccesstotaldistarea
    proposedproduction = now_sub.proposedproduction
    placerstreamdiversion = now_sub.placerstreamdiversion
    proposedproductionunit = now_sub.proposedproductionunit
    if placerundergroundoperations or placerhandoperations or placertotaldistarea or placerreclamation or placerreclamationcost or proposedproduction or placerreclamationarea or placerstreamdiversion:
        placer = app_models.PlacerOperation(
            reclamation_description=placerreclamation,
            reclamation_cost=placerreclamationcost,
            total_disturbed_area=placertotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            is_underground=get_boolean_value(placerundergroundoperations),
            is_hand_operation=get_boolean_value(placerhandoperations),
            has_stream_diversion=get_boolean_value(placerstreamdiversion) or False,
            proposed_production=proposedproduction,
            proposed_production_unit_type_code=code_lookup(app_models.UnitType,
                                                           unit_type_map[proposedproductionunit],
                                                           'unit_type_code'),
            reclamation_unit_type_code='HA',
            reclamation_area=placerreclamationarea)

        if (len(mms_now_sub.proposed_placer_activity) > 0):
            proposed_placer_activity = mms_now_sub.proposed_placer_activity
        else:
            proposed_placer_activity = now_sub.proposed_placer_activity

        for proposed in proposed_placer_activity:
            proposed_detail = app_models.PlacerOperationDetail(
                activity_type_description=proposed.type,
                disturbed_area=proposed.disturbedarea,
                timber_volume=proposed.timbervolume,
                width=getattr(proposed, 'width', None),
                length=getattr(proposed, 'length', None),
                depth=getattr(proposed, 'depth', None),
                quantity=proposed.quantity)

            etl_detail = app_models.ETLActivityDetail(placeractivityid=proposed.placeractivityid)
            proposed_detail._etl_activity_details.append(etl_detail)

            proposed_xref = app_models.ActivitySummaryDetailXref(
                summary=placer, detail=proposed_detail, is_existing=False)

        if (len(mms_now_sub.existing_placer_activity) > 0):
            existing_placer_activity = mms_now_sub.existing_placer_activity
        else:
            existing_placer_activity = now_sub.existing_placer_activity

        for existing in existing_placer_activity:
            existing_etl = app_models.ETLActivityDetail.query.filter_by(
                placeractivityid=existing.placeractivityid).first()

            if existing_etl:
                existing_detail = existing_etl.activity_detail
            else:
                existing_detail = app_models.PlacerOperationDetail(
                    activity_type_description=existing.type,
                    disturbed_area=existing.disturbedarea,
                    timber_volume=existing.timbervolume,
                    width=getattr(existing, 'width', None),
                    length=getattr(existing, 'length', None),
                    depth=getattr(existing, 'depth', None),
                    quantity=existing.quantity)

                etl_detail = app_models.ETLActivityDetail(
                    placeractivityid=existing.placeractivityid)
                existing_detail._etl_activity_details.append(etl_detail)

            existing_xref = app_models.ActivitySummaryDetailXref(
                summary=placer, detail=existing_detail, is_existing=True)

        for e in now_sub.placer_equip:
            equipment = _transmogrify_equipment(e)
            now_app.equipment.append(equipment)

        now_app.placer_operation = placer
    return


def _transmogrify_settling_ponds(now_app, now_sub, mms_now_sub):
    pondsreclamation = mms_now_sub.pondsreclamation or now_sub.pondsreclamation
    pondsreclamationcost = mms_now_sub.pondsreclamationcost or now_sub.pondsreclamationcost
    pondstotaldistarea = now_sub.pondstotaldistarea
    pondsexfiltratedtoground = mms_now_sub.pondsexfiltratedtoground or now_sub.pondsexfiltratedtoground
    pondsrecycled = mms_now_sub.pondsrecycled or now_sub.pondsrecycled
    pondsdischargedtoenv = mms_now_sub.pondsdischargedtoenv or now_sub.pondsdischargedtoenv
    pondswastewatertreatfacility = now_sub.pondswastewatertreatfacility
    cleanoutdisposalplan = now_sub.cleanoutdisposalplan
    pondtypeofsediment = now_sub.pondtypeofsediment
    pondtypeconstruction = now_sub.pondtypeconstruction
    pondarea = now_sub.pondarea
    pondspillwaydesign = now_sub.pondspillwaydesign

    if pondsreclamation or pondsreclamationcost or pondstotaldistarea or pondsexfiltratedtoground or pondsrecycled or pondsdischargedtoenv or pondswastewatertreatfacility or cleanoutdisposalplan:
        settling_pond = app_models.SettlingPond(
            reclamation_description=pondsreclamation,
            reclamation_cost=pondsreclamationcost,
            total_disturbed_area=pondstotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            is_ponds_exfiltrated=get_boolean_value(pondsexfiltratedtoground),
            is_ponds_recycled=get_boolean_value(pondsrecycled),
            is_ponds_discharged=get_boolean_value(pondsdischargedtoenv),
            wastewater_facility_description=pondswastewatertreatfacility,
            disposal_from_clean_out=cleanoutdisposalplan,
            sediment_control_structure_description=pondtypeofsediment,
            decant_structure_description=pondtypeconstruction,
            water_discharged_description=pondarea,
            spillway_design_description=pondspillwaydesign)

        proposed_settling_pond = now_sub.proposed_settling_pond

        for proposed in proposed_settling_pond:
            proposed_detail = app_models.SettlingPondDetail(
                activity_type_description=proposed.pondid,
                water_source_description=proposed.watersource,
                construction_plan=proposed.constructionmethod,
                width=proposed.width,
                length=proposed.length,
                depth=proposed.depth,
                disturbed_area=proposed.disturbedarea,
                timber_volume=proposed.timbervolume)

            etl_detail = app_models.ETLActivityDetail(settlingpondid=proposed.settlingpondid)
            proposed_detail._etl_activity_details.append(etl_detail)

            proposed_xref = app_models.ActivitySummaryDetailXref(
                summary=settling_pond, detail=proposed_detail, is_existing=False)

        existing_settling_pond = now_sub.existing_settling_pond

        for existing in existing_settling_pond:
            existing_etl = app_models.ETLActivityDetail.query.filter_by(
                settlingpondid=existing.settlingpondid).first()

            if existing_etl:
                existing_detail = existing_etl.activity_detail
            else:
                existing_detail = app_models.SettlingPondDetail(
                    activity_type_description=existing.pondid,
                    water_source_description=existing.watersource,
                    construction_plan=existing.constructionmethod,
                    width=existing.width,
                    length=existing.length,
                    depth=existing.depth,
                    disturbed_area=existing.disturbedarea,
                    timber_volume=existing.timbervolume)

                etl_detail = app_models.ETLActivityDetail(settlingpondid=existing.settlingpondid)
                existing_detail._etl_activity_details.append(etl_detail)

            existing_xref = app_models.ActivitySummaryDetailXref(
                summary=settling_pond, detail=existing_detail, is_existing=True)

        now_app.settling_pond = settling_pond
    return


def _transmogrify_blasting_activities(now_app, now_sub, mms_now_sub):
    bcexplosivespermitissued = mms_now_sub.bcexplosivespermitissued or now_sub.bcexplosivespermitissued
    bcexplosivespermitnumber = mms_now_sub.bcexplosivespermitnumber or now_sub.bcexplosivespermitnumber
    bcexplosivespermitexpiry = mms_now_sub.bcexplosivespermitexpiry or now_sub.bcexplosivespermitexpiry
    storeexplosivesonsite = now_sub.storeexplosivesonsite
    describeexplosivetosite = now_sub.describeexplosivetosite
    if bcexplosivespermitissued or bcexplosivespermitnumber or bcexplosivespermitexpiry or storeexplosivesonsite:
        now_app.blasting_operation = app_models.BlastingOperation(
            explosive_permit_issued=get_boolean_value(bcexplosivespermitissued),
            explosive_permit_number=bcexplosivespermitnumber,
            explosive_permit_expiry_date=bcexplosivespermitexpiry,
            describe_explosives_to_site=describeexplosivetosite,
            has_storage_explosive_on_site=get_boolean_value(storeexplosivesonsite))
    return


def _transmogrify_sand_gravel_quarry_operations_activities(now_app, now_sub, mms_now_sub):
    sandgrvqrydepthoverburden = now_sub.sandgrvqrydepthoverburden
    sandgrvqrydepthtopsoil = now_sub.sandgrvqrydepthtopsoil
    sandgrvqrystabilizemeasures = now_sub.sandgrvqrystabilizemeasures
    sandgrvqrywithinaglandres = mms_now_sub.sandgrvqrywithinaglandres or now_sub.sandgrvqrywithinaglandres
    sandgrvqryalrpermitnumber = now_sub.sandgrvqryalrpermitnumber
    sandgrvqrylocalgovsoilrembylaw = mms_now_sub.sandgrvqrylocalgovsoilrembylaw or now_sub.sandgrvqrylocalgovsoilrembylaw
    sandgrvqryofficialcommplan = now_sub.sandgrvqryofficialcommplan
    sandgrvqrylandusezoning = now_sub.sandgrvqrylandusezoning
    sandgrvqryendlanduse = now_sub.sandgrvqryendlanduse
    sandgrvqrytotalmineres = now_sub.sandgrvqrytotalmineres
    sandgrvqrytotalmineresunits = now_sub.sandgrvqrytotalmineresunits
    sandgrvqryannualextrest = now_sub.sandgrvqryannualextrest
    sandgrvqryannualextrestunits = now_sub.sandgrvqryannualextrestunits
    sandgrvqryreclamation = mms_now_sub.sandgrvqryreclamation or now_sub.sandgrvqryreclamation
    sandgrvqryreclamationbackfill = mms_now_sub.sandgrvqryreclamationbackfill or now_sub.sandgrvqryreclamationbackfill
    sandgrvqryreclamationcost = mms_now_sub.sandgrvqryreclamationcost or now_sub.sandgrvqryreclamationcost
    sandgrvqrygrdwtravgdepth = now_sub.sandgrvqrygrdwtravgdepth
    sandgrvqrygrdwtrexistingareas = now_sub.sandgrvqrygrdwtrexistingareas
    sandgrvqrygrdwtrtestpits = now_sub.sandgrvqrygrdwtrtestpits
    sandgrvqrygrdwtrtestwells = now_sub.sandgrvqrygrdwtrtestwells
    sandgrvqrygrdwtrother = now_sub.sandgrvqrygrdwtrother
    sandgrvqrygrdwtrmeasprotect = now_sub.sandgrvqrygrdwtrmeasprotect
    sandgrvqryimpactdistres = now_sub.sandgrvqryimpactdistres
    sandgrvqryimpactdistwater = now_sub.sandgrvqryimpactdistwater
    sandgrvqryimpactnoise = now_sub.sandgrvqryimpactnoise
    sandgrvqryimpactprvtaccess = now_sub.sandgrvqryimpactprvtaccess
    sandgrvqryimpactprevtdust = now_sub.sandgrvqryimpactprevtdust
    sandgrvqryimpactminvisual = now_sub.sandgrvqryimpactminvisual
    sandgrvqryprogressivereclam = now_sub.sandgrvqryprogressivereclam
    sandgrvqrymaxunreclaimed = now_sub.sandgrvqrymaxunreclaimed
    yearroundseasonal = now_sub.yearroundseasonal
    sandgrvqrydescription = now_sub.sandgrvqrydescription
    if (sandgrvqrydepthoverburden or sandgrvqrydepthtopsoil or sandgrvqrystabilizemeasures
            or sandgrvqrywithinaglandres or sandgrvqryalrpermitnumber
            or sandgrvqrylocalgovsoilrembylaw or sandgrvqryofficialcommplan
            or sandgrvqrylandusezoning or sandgrvqryendlanduse or sandgrvqrytotalmineres
            or sandgrvqrytotalmineresunits or sandgrvqryannualextrest
            or sandgrvqryannualextrestunits or sandgrvqryreclamation
            or sandgrvqryreclamationbackfill or sandgrvqryreclamationcost
            or sandgrvqrygrdwtravgdepth or sandgrvqrygrdwtrexistingareas or sandgrvqrygrdwtrtestpits
            or sandgrvqrygrdwtrtestwells or sandgrvqrygrdwtrother or sandgrvqrygrdwtrmeasprotect
            or sandgrvqryimpactdistres or sandgrvqryimpactdistwater or sandgrvqryimpactnoise
            or sandgrvqryimpactprvtaccess or sandgrvqryimpactprevtdust
            or sandgrvqryimpactminvisual):
        now_app.sand_gravel_quarry_operation = app_models.SandGravelQuarryOperation(
            average_overburden_depth=sandgrvqrydepthoverburden,
            average_overburden_depth_unit_type_code='MTR',
            average_top_soil_depth=sandgrvqrydepthtopsoil,
            average_top_soil_depth_unit_type_code='MTR',
            stability_measures_description=sandgrvqrystabilizemeasures,
            is_agricultural_land_reserve=get_boolean_value(sandgrvqrywithinaglandres),
            agri_lnd_rsrv_permit_application_number=sandgrvqryalrpermitnumber,
            has_local_soil_removal_bylaw=get_boolean_value(sandgrvqrylocalgovsoilrembylaw),
            community_plan=sandgrvqryofficialcommplan,
            land_use_zoning=sandgrvqrylandusezoning,
            proposed_land_use=sandgrvqryendlanduse,
            total_mineable_reserves=sandgrvqrytotalmineres,
            total_mineable_reserves_unit_type_code=code_lookup(
                app_models.UnitType, unit_type_map[now_sub.sandgrvqrytotalmineresunits],
                'unit_type_code'),
            total_annual_extraction=sandgrvqryannualextrest,
            total_annual_extraction_unit_type_code=code_lookup(
                app_models.UnitType, unit_type_map[now_sub.sandgrvqryannualextrestunits],
                'unit_type_code'),
            reclamation_description=sandgrvqryreclamation,
            reclamation_backfill_detail=sandgrvqryreclamationbackfill,
            reclamation_cost=sandgrvqryreclamationcost,
            average_groundwater_depth=sandgrvqrygrdwtravgdepth,
            average_groundwater_depth_unit_type_code="MTR",
            has_groundwater_from_existing_area=get_boolean_value(sandgrvqrygrdwtrexistingareas),
            has_groundwater_from_test_pits=get_boolean_value(sandgrvqrygrdwtrtestpits),
            has_groundwater_from_test_wells=get_boolean_value(sandgrvqrygrdwtrtestwells),
            groundwater_from_other_description=sandgrvqrygrdwtrother,
            groundwater_protection_plan=sandgrvqrygrdwtrmeasprotect,
            nearest_residence_distance=sandgrvqryimpactdistres,
            nearest_residence_distance_unit_type_code="MTR",
            nearest_water_source_distance=sandgrvqryimpactdistwater,
            nearest_water_source_distance_unit_type_code="MTR",
            noise_impact_plan=sandgrvqryimpactnoise,
            secure_access_plan=sandgrvqryimpactprvtaccess,
            dust_impact_plan=sandgrvqryimpactprevtdust,
            visual_impact_plan=sandgrvqryimpactminvisual,
            progressive_reclamation=get_boolean_value(sandgrvqryprogressivereclam),
            max_unreclaimed=sandgrvqrymaxunreclaimed,
            max_unreclaimed_unit_type_code="HA",
            work_year_info=yearroundseasonal,
            proposed_activity_description=sandgrvqrydescription)

        if (len(mms_now_sub.sand_grv_qry_activity) > 0):
            sand_grv_qry_activity = mms_now_sub.sand_grv_qry_activity
        else:
            sand_grv_qry_activity = now_sub.sand_grv_qry_activity

        for detail in sand_grv_qry_activity:
            now_app.sand_gravel_quarry_operation.details.append(
                app_models.SandGravelQuarryOperationDetail(
                    disturbed_area=detail.disturbedarea,
                    timber_volume=detail.timbervolume,
                    activity_type_description=detail.type))

        for e in now_sub.sand_grv_qry_equip:
            equipment = _transmogrify_equipment(e)
            now_app.equipment.append(equipment)

    return


def _transmogrify_surface_bulk_sample(now_app, now_sub, mms_now_sub):
    surfacebulksampleprocmethods = now_sub.surfacebulksampleprocmethods
    surfacebulksamplereclsephandl = mms_now_sub.surfacebulksamplereclsephandl or now_sub.surfacebulksamplereclsephandl
    surfacebulksamplereclamation = mms_now_sub.surfacebulksamplereclamation or now_sub.surfacebulksamplereclamation
    surfacebulksamplerecldrainmiti = mms_now_sub.surfacebulksamplerecldrainmiti or now_sub.surfacebulksamplerecldrainmiti
    surfacebulksamplereclcost = mms_now_sub.surfacebulksamplereclcost or now_sub.surfacebulksamplereclcost
    surfacebulksampletotaldistarea = now_sub.surfacebulksampletotaldistarea
    bedrockexcavation = now_sub.bedrockexcavation

    if (surfacebulksampleprocmethods or surfacebulksamplereclsephandl
            or surfacebulksamplereclamation or surfacebulksamplerecldrainmiti
            or surfacebulksamplereclcost or surfacebulksampletotaldistarea):
        now_app.surface_bulk_sample = app_models.SurfaceBulkSample(
            reclamation_description=surfacebulksamplereclamation,
            reclamation_cost=surfacebulksamplereclcost,
            total_disturbed_area=surfacebulksampletotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            processing_method_description=surfacebulksampleprocmethods,
            handling_instructions=surfacebulksamplereclsephandl,
            drainage_mitigation_description=surfacebulksamplerecldrainmiti,
            has_bedrock_excavation=get_boolean_value(bedrockexcavation))

        if (len(mms_now_sub.surface_bulk_sample_activity) > 0):
            surface_bulk_sample_activity = mms_now_sub.surface_bulk_sample_activity
        else:
            surface_bulk_sample_activity = now_sub.surface_bulk_sample_activity

        for detail in surface_bulk_sample_activity:
            now_app.surface_bulk_sample.details.append(
                app_models.SurfaceBulkSampleDetail(
                    disturbed_area=detail.disturbedarea,
                    quantity=detail.quantity,
                    timber_volume=detail.timbervolume,
                    activity_type_description=detail.type))

        for e in now_sub.surface_bulk_sample_equip:
            equipment = _transmogrify_equipment(e)
            now_app.equipment.append(equipment)
    return


def _transmogrify_underground_exploration(now_app, now_sub, mms_now_sub):
    underexptotalore = now_sub.underexptotalore
    underexptotaloreunits = now_sub.underexptotaloreunits
    underexpreclamation = mms_now_sub.underexpreclamation or now_sub.underexpreclamation
    underexpreclamationcost = mms_now_sub.underexpreclamationcost or now_sub.underexpreclamationcost
    underexptotalwaste = now_sub.underexptotalwaste
    underexptotalwasteunits = now_sub.underexptotalwasteunits
    underexptotaldistarea = now_sub.underexptotaldistarea

    underexpbulksample = now_sub.underexpbulksample
    underexpdewatering = now_sub.underexpdewatering
    underexpdimonddrill = now_sub.underexpdimonddrill
    underexpmappingchip = now_sub.underexpmappingchip
    underexpnewdev = now_sub.underexpnewdev
    underexprehab = now_sub.underexprehab
    underexpfuelstorage = now_sub.underexpfuelstorage
    underexpsurftotalore = now_sub.underexpsurftotalore
    underexpsurftotalwaste = now_sub.underexpsurftotalwaste
    underexpsurftotaloreunits = now_sub.underexpsurftotaloreunits
    underexpsurftotalwasteunits = now_sub.underexpsurftotalwasteunits
    if (underexptotalore or underexpreclamation or underexpreclamationcost or underexptotalwaste
            or underexptotaldistarea or underexpsurftotalwaste):
        now_app.underground_exploration = app_models.UndergroundExploration(
            reclamation_description=underexpreclamation,
            reclamation_cost=underexpreclamationcost,
            total_disturbed_area=underexptotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            total_ore_amount=underexptotalore,
            total_ore_unit_type_code=code_lookup(app_models.UnitType,
                                                 unit_type_map[underexptotaloreunits],
                                                 'unit_type_code'),
            total_waste_amount=underexptotalwaste,
            total_waste_unit_type_code=code_lookup(app_models.UnitType,
                                                   unit_type_map[underexptotalwasteunits],
                                                   'unit_type_code'),
            proposed_bulk_sample=underexpbulksample,
            proposed_de_watering=underexpdewatering,
            proposed_diamond_drilling=underexpdimonddrill,
            proposed_mapping_chip_sampling=underexpmappingchip,
            proposed_new_development=underexpnewdev,
            proposed_rehab=underexprehab,
            proposed_underground_fuel_storage=underexpfuelstorage,
            surface_total_ore_amount=underexpsurftotalore,
            surface_total_waste_amount=underexpsurftotalwaste,
            surface_total_ore_unit_type_code=code_lookup(app_models.UnitType,
                                                         unit_type_map[underexpsurftotaloreunits],
                                                         'unit_type_code'),
            surface_total_waste_unit_type_code=code_lookup(
                app_models.UnitType, unit_type_map[underexpsurftotalwasteunits], 'unit_type_code'))

        if (len(mms_now_sub.under_exp_new_activity) > 0):
            under_exp_new_activity = mms_now_sub.under_exp_new_activity
        else:
            under_exp_new_activity = now_sub.under_exp_new_activity

        for new_uea in under_exp_new_activity:
            now_app.underground_exploration.details.append(
                app_models.UndergroundExplorationDetail(
                    activity_type_description=new_uea.type,
                    incline=getattr(new_uea, 'incline', None),
                    incline_unit_type_code=code_lookup(
                        app_models.UnitType, unit_type_map[getattr(new_uea, 'inclineunits', None)],
                        'unit_type_code'),
                    quantity=new_uea.quantity,
                    length=getattr(new_uea, 'length', None),
                    width=getattr(new_uea, 'width', None),
                    height=getattr(new_uea, 'height', None),
                    underground_exploration_type_code='NEW'))

        if (len(mms_now_sub.under_exp_rehab_activity) > 0):
            under_exp_rehab_activity = mms_now_sub.under_exp_rehab_activity
        else:
            under_exp_rehab_activity = now_sub.under_exp_rehab_activity

        for rehab_uea in under_exp_rehab_activity:
            now_app.underground_exploration.details.append(
                app_models.UndergroundExplorationDetail(
                    activity_type_description=rehab_uea.type,
                    incline=getattr(rehab_uea, 'incline', None),
                    incline_unit_type_code=code_lookup(
                        app_models.UnitType, unit_type_map[getattr(rehab_uea, 'inclineunits',
                                                                   None)], 'unit_type_code'),
                    quantity=rehab_uea.quantity,
                    length=getattr(rehab_uea, 'length', None),
                    width=getattr(rehab_uea, 'width', None),
                    height=getattr(rehab_uea, 'height', None),
                    underground_exploration_type_code='RHB'))

        if (len(mms_now_sub.under_exp_surface_activity) > 0):
            under_exp_surface_activity = mms_now_sub.under_exp_surface_activity
        else:
            under_exp_surface_activity = now_sub.under_exp_surface_activity

        for surface_uea in under_exp_surface_activity:
            now_app.underground_exploration.details.append(
                app_models.UndergroundExplorationDetail(
                    activity_type_description=surface_uea.type,
                    quantity=surface_uea.quantity,
                    disturbed_area=surface_uea.disturbedarea,
                    timber_volume=surface_uea.timbervolume,
                    underground_exploration_type_code='SUR'))

    return


def _transmogrify_water_supply(now_app, now_sub, mms_now_sub):
    if now_sub.water_source_activity or mms_now_sub.water_source_activity:
        water_supply = app_models.WaterSupply()

        if (len(mms_now_sub.water_source_activity) > 0):
            water_source_activity = mms_now_sub.water_source_activity
        else:
            water_source_activity = now_sub.water_source_activity

        for wsa in water_source_activity:
            water_supply.details.append(
                app_models.WaterSupplyDetail(
                    supply_source_description=wsa.sourcewatersupply,
                    supply_source_type=wsa.type,
                    water_use_description=wsa.useofwater,
                    estimate_rate=wsa.estimateratewater,
                    pump_size=wsa.pumpsizeinwater,
                    intake_location=wsa.locationwaterintake,
                    estimate_rate_unit_type_code='MES' if now_sub else None))

        now_app.water_supply = water_supply
    return