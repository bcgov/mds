import re
from xml.etree.ElementTree import fromstring
from flask import current_app
from json import dumps
from xml.etree import ElementTree as ET
from app.extensions import db

from app.nris.models.inspection import Inspection
from app.nris.models.inspection_status import InspectionStatus
from app.nris.models.location import Location
from app.nris.models.inspection_order import InspectionOrder
from app.nris.models.order_request_detail import OrderRequestDetail
from app.nris.models.order_advisory_detail import OrderAdvisoryDetail
from app.nris.models.order_warning_detail import OrderWarningDetail
from app.nris.models.order_stop_detail import OrderStopDetail
from app.nris.models.order_type import OrderType
from app.nris.models.legislation import Legislation
from app.nris.models.legislation_act import LegislationAct
from app.nris.models.legislation_act_section import LegislationActSection
from app.nris.models.legislation_compliance_article import LegislationComplianceArticle
from app.nris.models.document import Document
from app.nris.models.document_type import DocumentType


def _clean_nris_data():
    db.session.execute('truncate table inspection cascade;')
    db.session.commit()


def _etl_nris_data(input):

    xmlstring = re.sub(' xmlns="[^"]+"', '', input, count=1)
    data = ET.fromstring(xmlstring)
    assessment_id = data.find('assessment_id')
    assessment_status = data.find('assessment_status')

    if assessment_status is not None:
        assessment_status_code = assessment_status.text

    if assessment_status_code != 'Deleted':
        assessment_date = data.find('assessment_date')
        business_area = data.find('businessArea').find('business_area_name')

        inspection = Inspection(
            external_id=assessment_id.text if assessment_id is not None else None)
        inspection.inspection_date = assessment_date.text if assessment_date is not None else None
        inspection.business_area = business_area.text if business_area is not None else None

        status_codes = InspectionStatus.find_all_inspection_status()
        code_exists = False
        status = None

        for code in status_codes:

            if code.inspection_status_code == assessment_status_code:
                code_exists = True
                status = code

        if not code_exists:
            status = create_status(assessment_status_code)

        inspection.inspection_status = status

        if assessment_status_code == 'Complete':
            completed_date = data.find('completion_date')
            inspection.completed_date = completed_date.text if completed_date is not None else None

        mine_number = data.find('location').find('location_id')
        inspector = data.find('assessor')
        intro = data.find('report_introduction')
        preamble = data.find('report_preamble')
        closing = data.find('report_closing')
        notes = data.find('officer_notes')

        inspection.mine_no = mine_number.text if mine_number is not None else None
        inspection.inspector_idir = inspector.text if inspector is not None else None
        inspection.inspection_introduction = intro.text if intro is not None else None
        inspection.inspection_preamble = preamble.text if preamble is not None else None
        inspection.inspection_closing = closing.text if closing is not None else None
        inspection.officer_notes = notes.text if notes is not None else None

        db.session.add(inspection)

        inspection_data = data.find('inspection')

        for attachment in data.findall('attachment'):
            doc = save_document(attachment)
            inspection.documents.append(doc)

        if inspection_data is not None:
            save_stops(inspection_data, inspection)


def create_status(status):
    inspection_status = InspectionStatus(inspection_status_code=status)
    db.session.add(inspection_status)
    return inspection_status


def save_stops(nris_inspection_data, inspection):
    for stop in nris_inspection_data.findall('stops'):
        order_location = stop.find('secondary_locations')
        if order_location is not None:
            latitude = order_location.find('secondary_latitude')
            longitude = order_location.find('secondary_longitude')
            desc = order_location.find('secondary_location_description')
            notes = order_location.find('secondary_location_notes')
            utm_info = order_location.find('secondary_location_utm')
            if utm_info is not None:
                utm_easting = utm_info.find('utm_easting')
                utm_northing = utm_info.find('utm_northing')
                utm_zone_number = utm_info.find('zone_number')
                utm_zone_letter = utm_info.find('zone_letter')
            location = Location(
                description=desc.text if desc is not None else None,
                notes=notes.text if notes is not None else None,
                latitude=latitude.text if latitude is not None else None,
                longitude=longitude.text if longitude is not None else None,
                utm_easting=utm_easting.text if utm_easting is not None else None,
                utm_northing=utm_northing.text if utm_northing is not None else None,
                zone_number=utm_zone_number.text if utm_zone_number is not None else None,
                zone_letter=utm_zone_letter.text if utm_zone_letter is not None else None)
            db.session.add(location)

        stop_type = stop.find('stop_type')
        order = InspectionOrder()
        order.location = location
        inspection.inspection_orders.append(order)

        order_types = OrderType.find_all_order_types()
        type_found = False
        order_type = None
        if stop_type is not None:
            for type in order_types:
                if type.order_type == stop_type.text:
                    type_found = True
                    order_type = type
        if not type_found:
            order_type = OrderType(order_type=stop_type.text)
            db.session.add(order_type)

        order.order_type_rel = order_type

        for stop_order in stop.findall('stop_orders'):
            stop_detail = save_stop_order(stop_order)
            order.stop_details.append(stop_detail)

        for stop_advisory in stop.findall('stop_advisories'):
            detail = stop_advisory.find('advisory_detail')
            advisory = OrderAdvisoryDetail(detail=detail.text if detail is not None else None)
            order.advisory_details.append(advisory)

        for stop_warning in stop.findall('stop_warnings'):
            detail = stop_warning.find('warning_detail')
            respond_date = stop_warning.find('warning_respond_date')
            warning = OrderWarningDetail(
                detail=detail.text if detail is not None else None,
                respond_date=respond_date.text if respond_date is not None else None)
            order.warning_details.append(warning)

        for stop_request in stop.findall('stop_requests'):
            detail = stop_request.find('request_detail')
            response = stop_request.find('request_response')
            respond_date = stop_request.find('request_respond_date')
            request = OrderRequestDetail(
                detail=detail.text if detail is not None else None,
                respond_date=respond_date.text if respond_date is not None else None,
                response=response.text if response is not None else None)
            order.request_details.append(request)

        for attachment in stop.findall('attachment'):
            doc = save_document(attachment)
            order.documents.append(doc)

        db.session.add(order)
        db.session.commit()


def save_stop_order(stop_order):
    stop_detail = OrderStopDetail()

    detail = stop_order.find('order_detail')
    stop_type = stop_order.find('order_type')
    response_status = stop_order.find('order_response_status')
    stop_status = stop_order.find('order_status')
    observation = stop_order.find('order_observation')
    response = stop_order.find('order_response')
    response_received = stop_order.find('order_response_received_date')
    completion_date = stop_order.find('order_completion_date')
    authority_act = stop_order.find('order_authority_act')
    authority_act_section = stop_order.find('order_authority_section')

    for order_legislation in stop_order.findall('order_legislations'):
        legislation = _save_order_legislation(order_legislation)
        stop_detail.legislations.append(legislation)

    stop_detail.detail = detail.text if detail is not None else None
    stop_detail.stop_type = stop_type.text if stop_type is not None else None
    stop_detail.response_status = response_status.text if response_status is not None else None
    stop_detail.stop_status = stop_status.text if stop_status is not None else None
    stop_detail.observation = observation.text if observation is not None else None
    stop_detail.response = response.text if response is not None else None
    stop_detail.response_received = response_received.text if response_received is not None else None
    stop_detail.completion_date = completion_date.text if completion_date is not None else None
    stop_detail.authority_act = authority_act.text if authority_act is not None else None
    stop_detail.authority_act_section = authority_act_section.text if authority_act_section is not None else None

    for attachment in stop_order.findall('attachment'):
        doc = save_document(attachment)
        stop_detail.documents.append(doc)

    return stop_detail


def _save_order_legislation(order_legislation):
    legislation = Legislation()

    estimated_incident_date = order_legislation.find('estimated_incident_date')
    noncompliant_description = order_legislation.find('noncompliant_description')
    parent_act = order_legislation.find('parent_act')
    act_regulation = order_legislation.find('act_regulation')
    section = order_legislation.find('section')
    compliance_article_id = order_legislation.find('compliance_article_id')
    compliance_article_comments = order_legislation.find('compliance_article_comments')

    legislation.estimated_incident_date = _parse_dumb_nris_date_string(
        estimated_incident_date.text) if estimated_incident_date is not None else None
    legislation.noncompliant_description = noncompliant_description.text if noncompliant_description is not None else None

    legislation.parent_legislation_act = _save_legislation_act(parent_act)
    legislation_act_regulation = _save_legislation_act(act_regulation)

    legislation.regulation_legislation_act_section = _save_legislation_act_section(
        legislation_act_regulation, section)
    legislation.compliance_article = _save_compliance_article(compliance_article_id,
                                                              compliance_article_comments)

    return legislation


def _parse_dumb_nris_date_string(_dumb_nris_date_string):
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


def save_document(attachment):
    external_id = attachment.find('attachment_id')
    document_date = attachment.find('attachment_date')
    file_name = attachment.find('file_path')
    comment = attachment.find('attachment_comment')

    doc = Document(
        external_id=external_id.text if external_id is not None else None,
        document_date=document_date.text if document_date is not None else None,
        file_name=file_name.text if file_name is not None else None,
        comment=comment.text if comment is not None else None)

    file_type = attachment.find('file_type')
    doc_type = find_or_save_doc_type(file_type)

    doc.document_type_rel = doc_type

    db.session.add(doc)
    return doc


def find_or_save_doc_type(file_type):
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

    return doc_type
