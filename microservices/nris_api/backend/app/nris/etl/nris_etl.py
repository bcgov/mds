import re
from xml.etree.ElementTree import fromstring
from flask import current_app
from json import dumps
from xml.etree import ElementTree as ET
from app.extensions import db

from app.nris.models.inspection import Inspection
from app.nris.models.inspection_status import InspectionStatus
from app.nris.models.location import Location
from app.nris.models.order import Order
from app.nris.models.order_request_detail import OrderRequestDetail
from app.nris.models.order_advisory_detail import OrderAdvisoryDetail
from app.nris.models.order_warning_detail import OrderWarningDetail
from app.nris.models.order_stop_detail import OrderStopDetail
from app.nris.models.order_type import OrderType


def _etl_nris_data(input):

    xmlstring = re.sub(' xmlns="[^"]+"', '', input, count=1)
    data = ET.fromstring(xmlstring)
    assessment_id = data.find('assessment_id')
    assessment_status = data.find('assessment_status')

    if assessment_status is not None:
        assessment_status_code = assessment_status.text

    if assessment_status_code != 'Deleted':

        if assessment_id is not None:
            inspection = Inspection(external_id=assessment_id.text)
        assessment_date = data.find('assessment_date')
        if assessment_date is not None:
            inspection.inspection_date = assessment_date.text
        business_area = data.find('businessArea').find('business_area_name')
        if business_area is not None:
            inspection.business_area = business_area.text

        status_codes = InspectionStatus.find_all_inspection_status()
        code_exists = False
        status = None

        for code in status_codes:

            if code.inspection_status_code == assessment_status_code:
                code_exists = True
                status = code

        if not code_exists:
            status = _create_status(assessment_status_code)

        inspection.inspection_status_id = status.inspection_status_id

        if assessment_status_code == 'Complete':
            completed_date = data.find('completion_date')

            if completed_date is not None:
                inspection.completed_date = completed_date.text

        mine_number = data.find('location').find('location_id')
        if mine_number is not None:
            inspection.mine_no = mine_number.text
        inspector = data.find('assessor')
        if inspector is not None:
            inspection.inspector_idir = inspector.text
        intro = data.find('report_introduction')
        if intro is not None:
            inspection.inspection_introduction = intro.text
        preamble = data.find('report_preamble')
        if preamble is not None:
            inspection.inspection_preamble = preamble.text
        closing = data.find('report_closing')
        if closing is not None:
            inspection.inspection_closing = closing.text

        notes = data.find('officer_notes')
        if notes is not None:
            inspection.officer_notes = notes.text

        db.session.add(inspection)
        db.session.commit()
        inspection_data = data.find('inspection')
        if inspection_data is not None:
            _save_stops(inspection_data, inspection.inspection_id)


def _create_status(status):
    inspection_status = InspectionStatus(inspection_status_code=status)
    db.session.add(inspection_status)
    db.session.commit()
    return inspection_status


def _save_stops(inspection, inspection_id):
    for stop in inspection.findall('stops'):
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
        order = Order(inspection_id=inspection_id)
        order.location = location

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

        order.order_type = order_type

        for stop_order in stop.findall('stop_orders'):
            stop_detail = _save_stop_order(stop_order)
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

        db.session.add(order)
        db.session.commit()


def _save_stop_order(stop_order):
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

    return stop_detail
