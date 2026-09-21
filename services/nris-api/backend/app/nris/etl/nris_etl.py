import re
import resource
import sys
import traceback
from collections import defaultdict

from flask import current_app

from xml.etree import ElementTree as ET
from app.extensions import db

from app.nris.models.inspection import Inspection
from app.nris.models.inspection_status import InspectionStatus
from app.nris.models.inspection_substatus import InspectionSubstatus
from app.nris.models.location import Location
from app.nris.models.inspected_location import InspectedLocation
from app.nris.models.order_request_detail import OrderRequestDetail
from app.nris.models.order_advisory_detail import OrderAdvisoryDetail
from app.nris.models.order_warning_detail import OrderWarningDetail
from app.nris.models.order_stop_detail import OrderStopDetail
from app.nris.models.inspected_location_type import InspectedLocationType
from app.nris.models.noncompliance_legislation import NonComplianceLegislation
from app.nris.models.noncompliance_permit import NonCompliancePermit
from app.nris.models.legislation_act import LegislationAct
from app.nris.models.legislation_act_section import LegislationActSection
from app.nris.models.legislation_compliance_article import LegislationComplianceArticle
from app.nris.models.document import Document
from app.nris.models.document_type import DocumentType
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.models.inspection_type import InspectionType
from app.nris.models.attendee import Attendee
from app.nris.models.attendee_type import AttendeeType

import cx_Oracle

# Truncates all tables on the nris schema, except for the alembic_version table and the nris_raw_data table.
TRUNCATE_TABLES_SQL = """
DO $$
DECLARE
i TEXT;
BEGIN
 FOR i IN (select distinct concat(table_schema, '.', table_name)  from information_schema.tables where table_catalog = 'mds' and table_schema = 'nris' and table_name != 'alembic_version' and table_name != 'nris_raw_data') LOOP
         EXECUTE 'TRUNCATE TABLE '|| i ||' RESTART IDENTITY CASCADE;';

  END LOOP;
END $$;
"""


def clean_nris_etl_data():
    db.session.execute(TRUNCATE_TABLES_SQL)
    db.session.commit()


def clean_nris_xml_import():
    db.session.execute('truncate table nris_raw_data restart identity cascade;')
    db.session.commit()


def import_nris_xml():
    dsn = f'(DESCRIPTION=(ADDRESS=(PROTOCOL=TCPS)(HOST={current_app.config["NRIS_DB_HOSTNAME"]})(PORT={current_app.config["NRIS_DB_PORT"]}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME={current_app.config["NRIS_DB_SERVICENAME"]}))(SECURITY=(ssl_server_cert_dn="{current_app.config["NRIS_SERVER_CERT_DN"]}")))'
    oracle_db = cx_Oracle.connect(
        user=current_app.config['NRIS_DB_USER'],
        password=current_app.config['NRIS_DB_PASSWORD'],
        dsn=dsn)

    # TODO: Remove this block once we can confirm the connection is using TCPS
    current_app.logger.info('NRIS DB connection type:')
    cursor = oracle_db.cursor()
    cursor.execute(
        "SELECT sys_context('USERENV', 'NETWORK_PROTOCOL') as network_protocol FROM dual")
    results = cursor.fetchall()
    for result in results:
        current_app.logger.info(result)
    cursor.close()

    cursor = oracle_db.cursor()
    # TODO: Change this to MCM if and when it is updated.
    cursor.execute(
        "select xml_document from CORS.CORS_CV_ASSESSMENTS_XVW where business_area = 'EMPR'")

    results = cursor.fetchall()
    for result in results:
        data = NRISRawData.create(result[0].read())
        db.session.add(data)

    cursor.close()
    db.session.commit()


def _get_memory_mb():
    usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    # ru_maxrss is bytes on macOS, kilobytes on Linux
    if sys.platform == 'darwin':
        return usage / (1024 * 1024)
    return usage / 1024


def etl_nris_data():
    nris_data = db.session.query(NRISRawData).order_by(NRISRawData.id).paginate(per_page=100)

    has_next_page = True
    i = 0
    processed = 0
    failure_reasons = defaultdict(int)

    total = nris_data.total
    current_app.logger.info(f'Parsing {total} assessments')

    while has_next_page:
        has_next_page = bool(nris_data.next_num)

        for item in nris_data.items:
            i += 1
            current_external_id = None

            if i % 500 == 0:
                current_app.logger.info(
                    f'Progress: {i}/{total} records processed | Memory (peak RSS): {_get_memory_mb():.1f} MB'
                )

            try:
                result, current_external_id = _parse_nris_element(item.nris_data)
                if result == 'processed':
                    processed += 1
                elif result == 'missing_status':
                    failure_reasons['Missing assessment_status element in XML'] += 1
                elif result == 'deleted':
                    failure_reasons['Assessment status: Deleted (excluded by design)'] += 1
            except Exception as e:
                db.session.rollback()
                reason = f'{type(e).__name__}: {str(e)[:200]}'
                failure_reasons[reason] += 1
                current_app.logger.error(
                    f'NRIS ETL Error: Failed to process record {i} (external_id={current_external_id}): {reason}'
                )
                current_app.logger.debug(traceback.format_exc())

        if has_next_page:
            nris_data = nris_data.next()

    total_failed = sum(failure_reasons.values())
    current_app.logger.info(f'NRIS ETL complete: {processed}/{total} records saved successfully')

    if total_failed > 0:
        current_app.logger.warning(
            f'NRIS ETL: {total_failed} records were not saved. Reason breakdown ({len(failure_reasons)} distinct reason(s)):'
        )
        for reason, count in sorted(failure_reasons.items(), key=lambda x: -x[1]):
            current_app.logger.warning(f'  [{count:>6}]  {reason}')
    else:
        current_app.logger.info('NRIS ETL: All records saved successfully, no failures.')



def _parse_element_text(_element):
    return _element.text if _element is not None else None


def _parse_nris_element(input):

    xmlstring = re.sub(' xmlns="[^"]+"', '', input, count=1)
    data = ET.fromstring(xmlstring)
    assessment_id_element = data.find('assessment_id')
    external_id = _parse_element_text(assessment_id_element)
    assessment_status = data.find('assessment_status')

    if assessment_status is None:
        current_app.logger.debug(f'Skipping assessment_id={external_id}: no assessment_status element in XML')
        return 'missing_status', external_id

    if assessment_status is not None and assessment_status.text != 'Deleted':
        assessment_status_code = assessment_status.text

        assessment_date = data.find('assessment_date')
        assessment_sub_type = data.find('assessment_sub_type')
        business_area = data.find('businessArea').find('business_area_name')

        # Find or create the inspection
        inspection = db.session.query(Inspection).filter_by(external_id=external_id).first()
        if inspection is None:
            inspection = Inspection(external_id=external_id)
            db.session.add(inspection)

        inspection.assessment_sub_type = _parse_element_text(assessment_sub_type)
        inspection.inspection_date = _parse_element_text(assessment_date)
        inspection.business_area = _parse_element_text(business_area)
        status = _find_or_save_inspection_status(assessment_status_code)
        inspection.inspection_status = status

        assessment_substatus = data.find('assessment_sub_status')
        substatus = _find_or_save_inspection_substatus(assessment_substatus)
        inspection.inspection_substatus = substatus

        if assessment_status_code == 'Complete':
            completed_date = data.find('completion_date')
            inspection.completed_date = _parse_element_text(completed_date)

        mine_number = data.find('location').find('location_id')
        inspector = data.find('assessor')
        intro = data.find('report_introduction')
        preamble = data.find('report_preamble')
        closing = data.find('report_closing')
        notes = data.find('officer_notes')

        authorization = data.find('authorization')

        inspection.mine_no = _parse_element_text(mine_number)
        inspection.inspector_idir = _parse_element_text(inspector)
        inspection.inspection_introduction = _parse_element_text(intro)
        inspection.inspection_preamble = _parse_element_text(preamble)
        inspection.inspection_closing = _parse_element_text(closing)
        inspection.officer_notes = _parse_element_text(notes)

        # Parse Authorization (Permit)
        if authorization is not None:
            inspection.inspection_auth_source_id = _parse_element_text(authorization.find('source_id'))
            inspection.inspection_auth_source_application = _parse_element_text(authorization.find('source_application'))
            inspection.inspection_auth_status = _parse_element_text(authorization.find('auth_status'))
            inspection.inspection_auth_type = _parse_element_text(authorization.find('auth_type'))

        inspection_data = data.find('inspection')
        inspection_type = inspection_data.find('inspection_type')
        inspection_report_sent_date = inspection_data.find('inspct_report_sent_date')

        inspct_from_date = inspection_data.find('inspct_from_date')
        inspct_to_date = inspection_data.find('inspct_to_date')

        inspection.inspection_from_date = _parse_element_text(inspct_from_date)
        inspection.inspection_to_date = _parse_element_text(inspct_to_date)

        inspection.inspection_report_sent_date = _parse_element_text(inspection_report_sent_date)
        if inspection_type is not None:
            inspection_type_code = _find_or_save_inspection_type(inspection_type)
            inspection.inspection_type = inspection_type_code

        for attachment in data.findall('attachment'):
            _save_document(attachment, inspection=inspection)

        if inspection_data is not None:
            _save_stops(inspection_data, inspection)

        for related_inspector in data.findall('related_Inspctrs'):
            _save_attendee(related_inspector, inspection)

        for attendance in data.findall('attendance'):
            _save_attendee(attendance, inspection)

        current_app.logger.debug(f'Committing inspection for external_id={external_id}')
        db.session.commit()
        return 'processed', external_id
    if assessment_status is not None and assessment_status.text == 'Deleted':
        return 'deleted', external_id
    return 'missing_status', external_id


def _find_or_save_inspection_status(assessment_status_code):
    status_codes = InspectionStatus.find_all_inspection_status()
    code_exists = False
    status = None

    for code in status_codes:
        if code.inspection_status_code == assessment_status_code:
            code_exists = True
            status = code

    if not code_exists:
        status = InspectionStatus(inspection_status_code=assessment_status_code)
        db.session.add(status)
    return status


def _save_stops(nris_inspection_data, inspection):
    for stop in nris_inspection_data.findall('stops'):
        order_location = stop.find('secondary_locations')
        location = None
        if order_location is not None:
            latitude = _parse_element_text(order_location.find('secondary_latitude'))
            longitude = _parse_element_text(order_location.find('secondary_longitude'))
            desc = _parse_element_text(order_location.find('secondary_location_description'))
            notes = _parse_element_text(order_location.find('secondary_location_notes'))
            utm_info = order_location.find('secondary_location_utm')
            utm_easting, utm_northing, utm_zone_number, utm_zone_letter = None, None, None, None
            if utm_info is not None:
                utm_easting = _parse_element_text(utm_info.find('utm_easting'))
                utm_northing = _parse_element_text(utm_info.find('utm_northing'))
                utm_zone_number = _parse_element_text(utm_info.find('zone_number'))
                utm_zone_letter = _parse_element_text(utm_info.find('zone_letter'))

            # Check if this location already exists for this inspection
            location = db.session.query(Location).join(InspectedLocation).filter(
                InspectedLocation.inspection_id == inspection.inspection_id,
                Location.description == desc,
                Location.latitude == latitude,
                Location.longitude == longitude
            ).first()

            if location is None:
                location = Location(
                    description=desc,
                    notes=notes,
                    latitude=latitude,
                    longitude=longitude,
                    utm_easting=utm_easting,
                    utm_northing=utm_northing,
                    zone_number=utm_zone_number,
                    zone_letter=utm_zone_letter)
                db.session.add(location)

        stop_type = stop.find('stop_type')
        inspected_location_type = _find_or_save_inspected_location_type(stop_type)

        # Find or create InspectedLocation
        inspected_location = db.session.query(InspectedLocation).filter_by(
            inspection_id=inspection.inspection_id,
            location_id=location.location_id if location else None,
            inspected_location_type_id=inspected_location_type.inspected_location_type_id
            if inspected_location_type else None
        ).first()

        if inspected_location is None:
            inspected_location = InspectedLocation()
            inspected_location.location = location
            inspected_location.inspected_location_type_rel = inspected_location_type
            inspection.inspected_locations.append(inspected_location)
            db.session.add(inspected_location)

        for stop_order in stop.findall('stop_orders'):
            _save_stop_order(stop_order, inspected_location)

        # Clear existing non-stop details to prevent duplicates on refresh
        inspected_location.advisory_details = []
        for stop_advisory in stop.findall('stop_advisories'):
            detail = stop_advisory.find('advisory_detail')
            advisory = OrderAdvisoryDetail(detail=_parse_element_text(detail))
            inspected_location.advisory_details.append(advisory)

        inspected_location.warning_details = []
        for stop_warning in stop.findall('stop_warnings'):
            detail = stop_warning.find('warning_detail')
            respond_date = stop_warning.find('warning_respond_date')
            warning = OrderWarningDetail(
                detail=_parse_element_text(detail), respond_date=_parse_element_text(respond_date))
            inspected_location.warning_details.append(warning)

        inspected_location.request_details = []
        for stop_request in stop.findall('stop_requests'):
            detail = stop_request.find('request_detail')
            response = stop_request.find('request_response')
            respond_date = stop_request.find('request_respond_date')
            request = OrderRequestDetail(
                detail=_parse_element_text(detail),
                respond_date=_parse_element_text(respond_date),
                response=_parse_element_text(response))
            inspected_location.request_details.append(request)

        for attachment in stop.findall('attachment'):
            _save_document(attachment, inspected_location=inspected_location)

def _save_stop_order(stop_order, inspected_location):
    order_number = _parse_element_text(stop_order.find('order_number'))

    # Find or create the Stop Detail by order number
    stop_detail = db.session.query(OrderStopDetail).filter_by(
        inspected_location_id=inspected_location.inspected_location_id,
        order_number=order_number
    ).first()

    if stop_detail is None:
        stop_detail = OrderStopDetail(order_number=order_number)
        inspected_location.stop_details.append(stop_detail)
        db.session.add(stop_detail)

    # Update fields
    stop_detail.detail = _parse_element_text(stop_order.find('order_detail'))
    stop_detail.stop_type = _parse_element_text(stop_order.find('order_type'))
    stop_detail.response_status = _parse_element_text(stop_order.find('order_response_status'))
    stop_detail.stop_status = _parse_element_text(stop_order.find('order_status'))
    stop_detail.observation = _parse_element_text(stop_order.find('order_observation'))
    stop_detail.response = _parse_element_text(stop_order.find('order_response'))
    stop_detail.response_received = _parse_element_text(stop_order.find('order_response_received_date'))
    stop_detail.completion_date = _parse_element_text(stop_order.find('order_completion_date'))
    stop_detail.authority_act = _parse_element_text(stop_order.find('order_authority_act'))
    stop_detail.authority_act_section = _parse_element_text(stop_order.find('order_authority_section'))

    # Refresh Legislations and Permits
    stop_detail.noncompliance_legislations = []
    for order_legislation in stop_order.findall('order_legislations'):
        noncompliance_legislation = _save_order_noncompliance_legislation(order_legislation)
        stop_detail.noncompliance_legislations.append(noncompliance_legislation)

    stop_detail.noncompliance_permits = []
    for order_permit in stop_order.findall('order_permits'):
        noncompliance_permit = _save_order_noncompliance_permit(order_permit)
        stop_detail.noncompliance_permits.append(noncompliance_permit)

    for order_condition in stop_order.findall('order_conditions'):
        noncompliance_permit = _save_order_noncompliance_condition(order_condition)
        stop_detail.noncompliance_permits.append(noncompliance_permit)

    for attachment in stop_order.findall('attachment'):
        _save_document(attachment, stop_detail=stop_detail)

    return stop_detail


def _find_or_save_inspected_location_type(stop_type):
    inspected_location_types = InspectedLocationType.find_all_inspected_location_types()
    type_found = False
    inspected_location_type = None
    if stop_type is not None:
        for type in inspected_location_types:
            if type.inspected_location_type == stop_type.text:
                type_found = True
                inspected_location_type = type
    if not type_found:
        inspected_location_type = InspectedLocationType(inspected_location_type=stop_type.text)
        db.session.add(inspected_location_type)
    return inspected_location_type


def _save_order_noncompliance_permit(order_permit):
    noncompliance_permit = NonCompliancePermit()

    permit_section_number = order_permit.find('permit_section_number')
    permit_section_text = order_permit.find('permit_section_text')
    permit_section_title = order_permit.find('permit_section_title')

    noncompliance_permit.section_number = _parse_element_text(permit_section_number)
    noncompliance_permit.section_title = _parse_element_text(permit_section_title)
    noncompliance_permit.section_text = _parse_element_text(permit_section_text)

    return noncompliance_permit


def _save_order_noncompliance_condition(order_condition):
    noncompliance_permit = NonCompliancePermit()

    pc_number = order_condition.find('pc_number')
    pc_text = order_condition.find('pc_text')

    noncompliance_permit.section_number = _parse_element_text(pc_number)
    noncompliance_permit.section_title = ""
    noncompliance_permit.section_text = _parse_element_text(pc_text)

    return noncompliance_permit



def _save_order_noncompliance_legislation(order_legislation):
    noncompliance_legislation = NonComplianceLegislation()

    estimated_incident_date = order_legislation.find('estimated_incident_date')
    noncompliant_description = order_legislation.find('noncompliant_description')
    parent_act = order_legislation.find('parent_act')
    act_regulation = order_legislation.find('act_regulation')
    section = order_legislation.find('section')
    compliance_article_id = order_legislation.find('compliance_article_id')
    compliance_article_comments = order_legislation.find('compliance_article_comments')

    noncompliance_legislation.estimated_incident_date = _parse_dumb_nris_date_string(
        _parse_element_text(estimated_incident_date))
    noncompliance_legislation.noncompliant_description = _parse_element_text(
        noncompliant_description)

    noncompliance_legislation.parent_legislation_act = _save_legislation_act(parent_act)
    legislation_act_regulation = _save_legislation_act(act_regulation)

    noncompliance_legislation.regulation_legislation_act_section = _save_legislation_act_section(
        legislation_act_regulation, section)
    noncompliance_legislation.compliance_article = _save_compliance_article(
        compliance_article_id, compliance_article_comments)

    return noncompliance_legislation


def _parse_dumb_nris_date_string(_dumb_nris_date_string):
    if _dumb_nris_date_string is None:
        return None

    return _replace_string_at_index(_dumb_nris_date_string, "T", 10)


def _replace_string_at_index(s, newstring, index, nofail=False):
    if not nofail and index not in range(len(s)):
        raise ValueError("index outside given string")
    if index < 0:
        return newstring + s
    if index > len(s):
        return s + newstring
    return s[:index] + newstring + s[index + 1:]


def _save_legislation_act(legislation_act_to_get):
    legislation_acts = LegislationAct.find_all_legislation_acts()
    act_found = False
    legislation_act = None

    if legislation_act_to_get is not None:
        for act in legislation_acts:
            if act.act == legislation_act_to_get.text:
                act_found = True
                legislation_act = act

        if not act_found:
            legislation_act = LegislationAct(act=legislation_act_to_get.text)
            db.session.add(legislation_act)

    return legislation_act


def _save_legislation_act_section(legislation_act, section_to_get):
    section_found = False
    section = None

    if legislation_act is not None and section_to_get is not None:
        for legislation_act_section in legislation_act.sections:
            if legislation_act_section.section == section_to_get.text:
                section_found = True
                section = legislation_act_section

        if not section_found:
            section = LegislationActSection(section=section_to_get.text)
            legislation_act.sections.append(section)
            db.session.add(section)

    return section


def _save_compliance_article(compliance_article_id, compliance_article_comments):
    if compliance_article_id is not None:
        compliance_article = LegislationComplianceArticle.find_legislation_compliance_article_by_external_id(
            compliance_article_id.text)

        if compliance_article is None:
            compliance_article = LegislationComplianceArticle(
                external_id=compliance_article_id.text, comments=compliance_article_comments.text)
            db.session.add(compliance_article)

        return compliance_article


def _save_document(attachment, inspection=None, inspected_location=None, stop_detail=None):
    external_id = _parse_element_text(attachment.find('attachment_id'))
    document_date = _parse_element_text(attachment.find('attachment_date'))
    file_name = _parse_element_text(attachment.find('file_path'))
    comment = _parse_element_text(attachment.find('attachment_comment'))

    # Find or create document
    doc = db.session.query(Document).filter_by(external_id=external_id).first()
    if doc is None:
        doc = Document(external_id=external_id)
        db.session.add(doc)

    doc.document_date = document_date
    doc.file_name = file_name
    doc.comment = comment

    file_type = attachment.find('file_type')
    doc_type = _find_or_save_doc_type(file_type)
    doc.document_type_rel = doc_type

    # Relate to the provided parent if not already related
    if inspection and doc not in inspection.documents:
        inspection.documents.append(doc)
    if inspected_location and doc not in inspected_location.documents:
        inspected_location.documents.append(doc)
    if stop_detail and doc not in stop_detail.documents:
        stop_detail.documents.append(doc)

    return doc


def _find_or_save_doc_type(file_type):
    types = DocumentType.find_all_document_types()
    type_found = False
    doc_type = None
    if file_type is not None:
        for type in types:
            if type.document_type == file_type.text:
                type_found = True
                doc_type = type
    if not type_found:
        doc_type = DocumentType(document_type=file_type.text)
        db.session.add(doc_type)

    return doc_type


def _find_or_save_inspection_type(inspection_type):
    types = InspectionType.find_all_inspection_types()
    type_found = False
    inspec_type = None
    if inspection_type is not None:
        for type in types:
            if type.inspection_type_code == inspection_type.text:
                type_found = True
                inspec_type = type
    if not type_found:
        inspec_type = InspectionType(inspection_type_code=inspection_type.text)
        db.session.add(inspec_type)
    return inspec_type


def _save_attendee(attendance, inspection):
    first_name = _parse_element_text(attendance.find('attendance_first_name'))
    last_name = _parse_element_text(attendance.find('attendance_last_name'))
    attendee_type_value = attendance.find('attendance_type')
    attendance_type = _find_or_save_attendee_type(attendee_type_value)

    # Find or create attendee
    attendee = db.session.query(Attendee).filter_by(
        inspection_id=inspection.inspection_id,
        first_name=first_name,
        last_name=last_name,
        attendee_type_id=attendance_type.attendee_type_id
    ).first()

    if attendee is None:
        attendee = Attendee(
            first_name=first_name,
            last_name=last_name,
            inspection=inspection,
            attendee_type_rel=attendance_type
        )
        db.session.add(attendee)

    attendee.org = _parse_element_text(attendance.find('org'))
    attendee.title = _parse_element_text(attendance.find('attendance_title'))

    return attendee


def _find_or_save_attendee_type(attendee_type):
    types = AttendeeType.find_all_attendee_types()
    type_found = False
    attend_type = None
    attendee_type_text = None
    if attendee_type is not None:
        attendee_type_text = attendee_type.text
    else:
        attendee_type_text = "Unknown"
    for type in types:
        if type.attendee_type == attendee_type_text:
            type_found = True
            attend_type = type
    if not type_found:
        attend_type = AttendeeType(attendee_type=attendee_type_text)
        db.session.add(attend_type)
    return attend_type


def _find_or_save_inspection_substatus(inspection_substatus):
    substatuses = InspectionSubstatus.find_all_inspection_substatus()
    substatus_found = False
    inspec_substatus = None
    if inspection_substatus is not None:
        for substatus in substatuses:
            if substatus.inspection_substatus_code == inspection_substatus.text:
                substatus_found = True
                inspec_substatus = substatus
    if not substatus_found:
        inspec_substatus = InspectionSubstatus(inspection_substatus_code=inspection_substatus.text)
        db.session.add(inspec_substatus)
    return inspec_substatus
