from flask_restplus import Resource, reqparse, inputs
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_do, requires_role_mine_admin, is_minespace_user, requires_any_of, EDIT_DO, MINESPACE_PROPONENT

from app.api.mines.mine.models.mine import Mine
from app.api.mines.incidents.models.mine_incident_document_xref import MineIncidentDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.incidents.models.mine_incident_document_type_code import MineIncidentDocumentTypeCode
from app.api.incidents.models.mine_incident import MineIncident
from app.api.incidents.models.mine_incident_recommendation import MineIncidentRecommendation
from app.api.incidents.models.mine_incident_category import MineIncidentCategory
from app.api.parties.party.models.party import Party
from app.api.activity.utils import trigger_notifcation

from app.api.mines.response_models import MINE_INCIDENT_MODEL


def _compliance_article_is_do_subparagraph(ca):
    if ca is None:
        return False

    return ca.article_act_code == 'HSRCM' and ca.section == '1' and ca.sub_section == '7' and ca.paragraph == '3' and ca.sub_paragraph is not None


class MineIncidentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    # required
    parser.add_argument(
        'incident_timestamp',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        location='json',
        required=True)
    parser.add_argument('incident_description', type=str, location='json', required=True)
    parser.add_argument(
        'reported_timestamp',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        required=False,
        location='json')
    parser.add_argument('reported_by_name', type=str, location='json')
    parser.add_argument('reported_by_email', type=str, location='json')
    parser.add_argument('reported_by_phone_no', type=str, location='json')
    parser.add_argument('reported_by_phone_ext', type=str, location='json')
    parser.add_argument('emergency_services_called', type=inputs.boolean, location='json')
    parser.add_argument('number_of_injuries', type=int, location='json')
    parser.add_argument('number_of_fatalities', type=int, location='json')
    parser.add_argument('reported_to_inspector_party_guid', type=str, location='json')
    parser.add_argument('responsible_inspector_party_guid', type=str, location='json')
    parser.add_argument('determination_inspector_party_guid', type=str, location='json')
    parser.add_argument('proponent_incident_no', type=str, location='json')
    parser.add_argument('determination_type_code', type=str, location='json')
    parser.add_argument('followup_investigation_type_code', type=str, location='json')
    parser.add_argument('followup_inspection', type=inputs.boolean, location='json')
    parser.add_argument('mine_determination_type_code', type=str, location='json')
    parser.add_argument('mine_determination_representative', type=str, location='json')
    parser.add_argument(
        'followup_inspection_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False,
        location='json')
    parser.add_argument('status_code', type=str, location='json')
    parser.add_argument('dangerous_occurrence_subparagraph_ids', type=list, location='json')
    parser.add_argument('updated_documents', type=list, location='json', store_missing=False)
    parser.add_argument('recommendations', type=list, location='json', store_missing=False)
    parser.add_argument('categories', type=list, location='json', store_missing=False)
    parser.add_argument('immediate_measures_taken', type=str, location='json')
    parser.add_argument('injuries_description', type=str, location='json')
    parser.add_argument('johsc_worker_rep_name', type=str, location='json')
    parser.add_argument('johsc_worker_rep_contacted', type=inputs.boolean, location='json')
    parser.add_argument('johsc_management_rep_name', type=str, location='json')
    parser.add_argument('johsc_management_rep_contacted', type=inputs.boolean, location='json')

    @api.marshal_with(MINE_INCIDENT_MODEL, envelope='records', code=200)
    @api.doc(description='returns the incidents for a given mine.')
    @requires_role_view_all
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound("Mine not found")
        return [i for i in mine.mine_incidents if i.deleted_ind == False]

    def _get_year_incident(self, incident_timestamp):
        return incident_timestamp.year

    @api.expect(MINE_INCIDENT_MODEL)
    @api.doc(description='creates a new incident for the mine')
    @api.marshal_with(MINE_INCIDENT_MODEL, code=201)
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        if is_minespace_user() is not True:
            do_sub_codes = []
            if data['determination_type_code'] == 'DO':
                do_sub_codes = data['dangerous_occurrence_subparagraph_ids']
                if not do_sub_codes:
                    raise BadRequest(
                        'Dangerous occurrences require one or more cited sections of HSRC code 1.7.3'
                    )
        # TODO: This logic/flow needs to be reworked since the CORE form no longer has this value.
        reported_timestamp_default = datetime.utcnow()

        mine_incident_year = self._get_year_incident(data['incident_timestamp'])
        incident = MineIncident.create(
            mine,
            data['incident_timestamp'],
            data['incident_description'],
            data['determination_type_code'],
            mine_determination_type_code=data['mine_determination_type_code'],
            mine_determination_representative=data['mine_determination_representative'],
            followup_investigation_type_code=data['followup_investigation_type_code']
            if is_minespace_user() is not True else None,
            reported_timestamp=reported_timestamp_default,
            reported_by_name=data['reported_by_name'],
        )

        incident.mine_incident_id_year = mine_incident_year
        incident.reported_by_email = data.get('reported_by_email')
        incident.reported_by_phone_no = data.get('reported_by_phone_no')
        incident.reported_by_phone_ext = data.get('reported_by_phone_ext')
        incident.number_of_fatalities = data.get('number_of_fatalities')
        incident.number_of_injuries = data.get('number_of_injuries')
        incident.emergency_services_called = data.get('emergency_services_called')
        incident.proponent_incident_no = data.get('proponent_incident_no')
        incident.immediate_measures_taken = data.get('immediate_measures_taken')
        incident.injuries_description = data.get('injuries_description')
        incident.johsc_worker_rep_name = data.get('johsc_worker_rep_name')
        incident.johsc_worker_rep_contacted = data.get('johsc_worker_rep_contacted')
        incident.johsc_management_rep_name = data.get('johsc_management_rep_name')
        incident.johsc_management_rep_contacted = data.get('johsc_management_rep_contacted')

        incident.status_code = data.get('status_code')

        if is_minespace_user() is not True:
            incident.followup_inspection = data.get('followup_inspection')
            incident.followup_inspection_date = data.get('followup_inspection_date')

            # lookup and validated inspector party relationships
            tmp_party = Party.query.filter_by(
                party_guid=data.get('reported_to_inspector_party_guid')).first()
            if tmp_party and 'INS' in tmp_party.business_roles_codes:
                incident.reported_to_inspector_party_guid = tmp_party.party_guid
            tmp_party = Party.query.filter_by(
                party_guid=data.get('responsible_inspector_party_guid')).first()
            if tmp_party and 'INS' in tmp_party.business_roles_codes:
                incident.responsible_inspector_party_guid = tmp_party.party_guid
            tmp_party = Party.query.filter_by(
                party_guid=data.get('determination_inspector_party_guid')).first()
            if tmp_party and 'INS' in tmp_party.business_roles_codes:
                incident.determination_inspector_party_guid = tmp_party.party_guid

            incident.determination_type_code = data.get('determination_type_code')
            incident.followup_investigation_type_code = data.get('followup_investigation_type_code')

            for id in do_sub_codes:
                sub = ComplianceArticle.find_by_compliance_article_id(id)
                if not _compliance_article_is_do_subparagraph(sub):
                    raise BadRequest(
                        'One of the provided compliance articles is not a sub-paragraph of section 1.7.3 (dangerous occurrences)'
                    )
                incident.dangerous_occurrence_subparagraphs.append(sub)

        updated_documents = data.get('updated_documents')
        if updated_documents is not None:
            for updated_file in updated_documents:
                mine_doc = MineDocument(
                    mine_guid=mine.mine_guid,
                    document_name=updated_file['document_name'],
                    document_manager_guid=updated_file['document_manager_guid'])

                if not mine_doc:
                    raise BadRequest('Unable to register uploaded file as document')

                mine_doc.save()

                mine_incident_doc = MineIncidentDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    mine_incident_id=incident.mine_incident_id,
                    mine_incident_document_type_code=updated_file['mine_incident_document_type_code']
                    if updated_file['mine_incident_document_type_code'] else 'INI')

                incident.documents.append(mine_incident_doc)

        if is_minespace_user() is not True:
            recommendations = data.get('recommendations')
            if recommendations is not None:
                for recommendation in recommendations:
                    rec_string = recommendation.get('recommendation')
                    if rec_string is None:
                        continue
                    new_recommendation = MineIncidentRecommendation.create(
                        rec_string, mine_incident_id=incident.mine_incident_id)
                    new_recommendation.save()

        categories = data.get('categories', [])
        for category in categories:
            code = MineIncidentCategory.find_by_code(category)
            if not code:
                raise BadRequest(f'Incident category code is not found: {code}')
            incident.categories.append(code)

        try:
            incident.save()
            incident.send_incidents_email()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return incident, 201


class MineIncidentResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    # required
    parser.add_argument(
        'incident_timestamp',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        location='json',
        store_missing=False)
    parser.add_argument('incident_description', type=str, location='json', store_missing=False)
    parser.add_argument(
        'reported_timestamp',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d %H:%M') if x else None,
        store_missing=False,
        location='json')
    parser.add_argument('reported_by_name', type=str, location='json', store_missing=False)
    parser.add_argument('reported_by_email', type=str, location='json', store_missing=False)
    parser.add_argument('reported_by_phone_no', type=str, location='json', store_missing=False)
    parser.add_argument('reported_by_phone_ext', type=str, location='json', store_missing=False)
    parser.add_argument(
        'emergency_services_called', type=inputs.boolean, location='json', store_missing=False)
    parser.add_argument('number_of_injuries', type=int, location='json', store_missing=False)
    parser.add_argument('number_of_fatalities', type=int, location='json', store_missing=False)
    parser.add_argument(
        'reported_to_inspector_party_guid', type=str, location='json', store_missing=False)
    parser.add_argument(
        'responsible_inspector_party_guid', type=str, location='json', store_missing=False)
    parser.add_argument(
        'determination_inspector_party_guid', type=str, location='json', store_missing=False)
    parser.add_argument('proponent_incident_no', type=str, location='json', store_missing=False)
    parser.add_argument('determination_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'followup_investigation_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'followup_inspection', type=inputs.boolean, location='json', store_missing=False)
    parser.add_argument(
        'followup_inspection_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False,
        location='json')
    parser.add_argument('status_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'dangerous_occurrence_subparagraph_ids', type=list, location='json', store_missing=False)
    parser.add_argument('updated_documents', type=list, location='json', store_missing=False)
    parser.add_argument('recommendations', type=list, location='json', store_missing=False)
    parser.add_argument(
        'mine_determination_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'mine_determination_representative', type=str, location='json', store_missing=False)
    parser.add_argument('categories', type=list, location='json', store_missing=False)
    parser.add_argument('immediate_measures_taken', type=str, location='json')
    parser.add_argument('injuries_description', type=str, location='json')
    parser.add_argument('johsc_worker_rep_name', type=str, location='json')
    parser.add_argument('johsc_worker_rep_contacted', type=inputs.boolean, location='json')
    parser.add_argument('johsc_management_rep_name', type=str, location='json')
    parser.add_argument('johsc_management_rep_contacted', type=inputs.boolean, location='json')

    @api.marshal_with(MINE_INCIDENT_MODEL, code=200)
    @requires_role_view_all
    def get(self, mine_guid, mine_incident_guid):
        incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        if not incident:
            raise NotFound("Mine Incident not found")
        return incident

    @requires_role_mine_admin
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, mine_incident_guid):
        incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        if not incident:
            raise NotFound('Mine incident not found')

        incident.delete()
        return None, 204

    @api.expect(parser)
    @api.marshal_with(MINE_INCIDENT_MODEL, code=200)
    @requires_role_edit_do
    def put(self, mine_guid, mine_incident_guid):
        incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        if not incident or str(incident.mine_guid) != mine_guid:
            raise NotFound("Mine Incident not found")

        data = self.parser.parse_args()

        do_sub_codes = []
        if data['determination_type_code'] == 'DO':
            do_sub_codes = data['dangerous_occurrence_subparagraph_ids']
            if not do_sub_codes:
                raise BadRequest(
                    'Dangerous occurrences require one or more cited sections of HSRC code 1.7.3')

        for key, value in data.items():
            if key in ['dangerous_occurrence_subparagraph_ids', 'recommendations', 'categories']:
                continue
            if key in [
                    'reported_to_inspector_party_guid', 'responsible_inspector_party_guid',
                    'determination_inspector_party_guid'
            ]:
                tmp_party = Party.query.filter_by(party_guid=value).first()
                if tmp_party and 'INS' in tmp_party.business_roles_codes:
                    setattr(incident, key, value)
            if key in ['status_code']:
                if value == 'AFR':
                    # Need to send an email to the proponent and OIC with mostly same content just slightly different.
                    incident.send_awaiting_final_report_email(True)
                    incident.send_awaiting_final_report_email(False)
                    trigger_notifcation(f'A new Mine Incident has been created for ({incident.mine_name})', incident.mine_table, 'MineIncident', incident.mine_incident_guid, {})
                if value == 'FRS':
                    incident.send_final_report_received_email(True)
                    incident.send_final_report_received_email(False)
                    trigger_notifcation(f'A final report has been submitted for ({incident.mine_incident_report_no}) on ({incident.mine_name})', incident.mine_table, 'MineIncident', incident.mine_incident_guid, {})
                setattr(incident, key, value)
            else:
                setattr(incident, key, value)

        recommendations = data.get('recommendations')
        if recommendations is not None:
            self._handle_recommendations(incident, recommendations)

        categories = data.get('categories', [])
        incident.categories = []
        for category in categories:
            code = MineIncidentCategory.find_by_code(category)
            if not code:
                raise BadRequest(f'Incident category code is not found: {code}')
            incident.categories.append(code)

        incident.dangerous_occurrence_subparagraphs = []
        for id in do_sub_codes:
            sub = ComplianceArticle.find_by_compliance_article_id(id)
            if not _compliance_article_is_do_subparagraph(sub):
                raise BadRequest(
                    'One of the provided compliance articles is not a sub-paragraph of section 1.7.3 (dangerous occurrences)'
                )
            incident.dangerous_occurrence_subparagraphs.append(sub)

        updated_documents = data.get('updated_documents')
        if updated_documents is not None:
            for updated_document in updated_documents:
                if not any(
                        str(doc.document_manager_guid) == updated_document['document_manager_guid']
                        for doc in incident.documents):
                    mine_doc = MineDocument(
                        mine_guid=mine_guid,
                        document_name=updated_document['document_name'],
                        document_manager_guid=updated_document['document_manager_guid'])

                    if not mine_doc:
                        raise BadRequest('Unable to register uploaded file as document')

                    mine_doc.save()
                    mine_incident_doc = MineIncidentDocumentXref(
                        mine_document_guid=mine_doc.mine_document_guid,
                        mine_incident_id=incident.mine_incident_id,
                        mine_incident_document_type_code=updated_document[
                            'mine_incident_document_type_code']
                        if updated_document['mine_incident_document_type_code'] else 'INI')

                    incident.documents.append(mine_incident_doc)
                    mine_incident_doc.save()

            for doc in incident.documents:
                if not any(
                        updated_document['document_manager_guid'] == str(doc.document_manager_guid)
                        for updated_document in updated_documents):
                    incident.documents.remove(doc)
                    db.session.delete(doc)
                    db.session.commit()

        incident.save()
        return incident

    @classmethod
    def _handle_recommendations(cls, incident, recommendations):
        for recommendation in recommendations:
            edited_rec_guid = recommendation.get('mine_incident_recommendation_guid')
            rec_string = recommendation.get('recommendation')
            if rec_string is None or rec_string == '':
                if recommendation.get('mine_incident_recommendation_guid') is not None:
                    # Remove existing empty recommendations
                    rec = MineIncidentRecommendation.find_by_mine_incident_recommendation_guid(
                        edited_rec_guid)
                    rec.deleted_ind = True
                    rec.save()

                # Skip new empty recommendations
                continue

            # Update recommendations
            if edited_rec_guid is not None:
                rec = MineIncidentRecommendation.find_by_mine_incident_recommendation_guid(
                    edited_rec_guid)
                if rec is not None:
                    rec.recommendation = rec_string
                    rec.save()
                    continue

            # Create new_recommendations
            new_recommendation = MineIncidentRecommendation.create(
                recommendation['recommendation'], mine_incident_id=incident.mine_incident_id)
            new_recommendation.save()
