from flask_restplus import Resource, reqparse, fields, inputs
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create

from app.api.mines.mine.models.mine import Mine
from ..models.mine_incident import MineIncident
from app.api.mines.compliance.models.compliance_article import ComplianceArticle
from ...mine_api_models import MINE_INCIDENT_MODEL


def _compliance_article_is_do_subparagraph(ca):
    if ca is None:
        return False

    return ca.article_act_code == 'HSRCM' and ca.section == '1' and ca.sub_section == '7' and ca.paragraph == '3' and ca.sub_paragraph is not None


class MineIncidentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    #required
    parser.add_argument(
        'incident_timestamp',
        help='Datetime of when the incident occured ',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        location='json',
        required=True)
    parser.add_argument(
        'incident_description',
        help='reported details of the incident',
        type=str,
        location='json',
        required=True)
    #optional and defaulted
    parser.add_argument(
        'determination_type_code',
        help='Mark incident as a dangerous occurance',
        type=str,
        location='json'),
    parser.add_argument(
        'followup_type_code',
        help='Mark incident to have a follow up inspection',
        type=str,
        location='json')
    #nullable
    parser.add_argument(
        'dangerous_occurrence_subparagraph_ids',
        help='List of dangerous occurrence sub-paragraphs from the HSRC code',
        type=list,
        location='json')
    parser.add_argument(
        'followup_inspection_no', help='NRIS ID of follow up inspection', type=str, location='json')
    parser.add_argument(
        'reported_timestamp',
        help='Datetime of when the incident was reported',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        location='json')
    parser.add_argument(
        'reported_by', help='Name of party who reported the incident', type=str, location='json')
    parser.add_argument(
        'reported_by_role', help='Job title of incident reporter', type=str, location='json')

    @api.marshal_with(MINE_INCIDENT_MODEL, envelope='mine_incidents', code=200, as_list=True)
    @api.doc(description='returns the incidents for a given mine.')
    @requires_role_mine_view
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound("Mine not found")
        return mine.mine_incidents

    @api.expect(parser)
    @api.doc(description='creates a new incident for the mine')
    @api.marshal_with(MINE_INCIDENT_MODEL, code=201)
    @requires_role_mine_create
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()

        do_sub_codes = []
        if data['determination_type_code'] == 'DO':
            do_sub_codes = data['dangerous_occurrence_subparagraph_ids']
            if not do_sub_codes:
                raise BadRequest(
                    'Dangerous occurrences require one or more cited sections of HSRC code 1.7.3')

        incident = MineIncident.create(
            mine,
            data['incident_timestamp'],
            data['incident_description'],
            determination_type_code=data['determination_type_code'] or 'PEN',
            followup_type_code=data['followup_type_code'] or 'UND',
            followup_inspection_no=data['followup_inspection_no'],
            reported_timestamp=data['reported_timestamp'],
            reported_by=data['reported_by'],
            reported_by_role=data['reported_by_role'],
        )
        for id in do_sub_codes:
            sub = ComplianceArticle.find_by_compliance_article_id(id)
            if not _compliance_article_is_do_subparagraph(sub):
                raise BadRequest(
                    'One of the provided compliance articles is not a sub-paragraph of section 1.7.3 (dangerous occurrences)'
                )
            incident.dangerous_occurrence_subparagraphs.append(sub)
        try:
            incident.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return incident, 201


class MineIncidentResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'incident_timestamp',
        help='Datetime of when the incident occured ',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        location='json',
        store_missing=False)
    parser.add_argument(
        'incident_description',
        help='reported details of the incident',
        type=str,
        location='json',
        store_missing=False)
    parser.add_argument(
        'reported_timestamp',
        help='Datetime of when the incident was reported',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        location='json',
        store_missing=False)
    parser.add_argument(
        'reported_by',
        help='Name of party who reported the incident',
        type=str,
        location='json',
        store_missing=False)
    parser.add_argument(
        'reported_by_role',
        help='Job title of incident reporter',
        type=str,
        location='json',
        store_missing=False)
    parser.add_argument(
        'determination_type_code',
        help='Mark incident as a dangerous occurance',
        type=str,
        location='json',
        store_missing=False)
    parser.add_argument(
        'followup_type_code',
        help='Mark incident to have a follow up inspection',
        location='json',
        type=str,
        store_missing=False)
    parser.add_argument(
        'dangerous_occurrence_subparagraph_ids',
        help='List of dangerous occurrence sub-paragraphs from the HSRC code',
        type=list,
        location='json',
        store_missing=False)
    parser.add_argument(
        'followup_inspection_no',
        help='NRIS inspection related to this incident',
        location='json',
        type=str,
        store_missing=False)
    parser.add_argument(
        'closing_report_summary',
        help='Report from mine in reaction to the incident',
        location='json',
        type=str,
        store_missing=False)

    @api.marshal_with(MINE_INCIDENT_MODEL, code=200)
    @requires_role_mine_view
    def get(self, mine_incident_guid):
        incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        if not incident:
            raise NotFound("Mine Incident not found")
        return incident

    @api.expect(parser)
    @api.marshal_with(MINE_INCIDENT_MODEL, code=200)
    @requires_role_mine_create
    def put(self, mine_incident_guid):
        incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        if not incident:
            raise NotFound("Mine Incident not found")

        data = self.parser.parse_args()
        do_sub_codes = []
        if data['determination_type_code'] == 'DO':
            do_sub_codes = data['dangerous_occurrence_subparagraph_ids']
            if not do_sub_codes:
                raise BadRequest(
                    'Dangerous occurrences require one or more cited sections of HSRC code 1.7.3')

        for key, value in data.items():
            if key == 'dangerous_occurrence_subparagraph_ids':
                continue
            setattr(incident, key, value)

        incident.dangerous_occurrence_subparagraphs = []
        for id in do_sub_codes:
            sub = ComplianceArticle.find_by_compliance_article_id(id)
            if not _compliance_article_is_do_subparagraph(sub):
                raise BadRequest(
                    'One of the provided compliance articles is not a sub-paragraph of section 1.7.3 (dangerous occurrences)'
                )
            incident.dangerous_occurrence_subparagraphs.append(sub)

        try:
            incident.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')
        return incident