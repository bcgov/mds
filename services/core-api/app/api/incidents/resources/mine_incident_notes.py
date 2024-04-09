from flask_restx import Resource
from werkzeug.exceptions import NotFound, InternalServerError, BadRequest

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, MINE_ADMIN, is_minespace_user, EDIT_INCIDENTS
from app.api.mines.mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.incidents.response_models import MINE_INCIDENT_NOTE_MODEL
from app.api.incidents.models.mine_incident_note import MineIncidentNote
from app.api.incidents.models.mine_incident import MineIncident


class MineIncidentNoteResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'content',
        type=str,
        store_missing=False,
        required=True,
    )

    @api.doc(
        description='Get a Mine Incident Note.',
        params={
            'mine_incident_guid': 'The GUID of the mine incident the note belongs to.',
            'mine_incident_note_guid': 'The GUID of the mine incident note to get.'
        })
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(MINE_INCIDENT_NOTE_MODEL, code=200)
    def get(self, mine_incident_guid, mine_incident_note_guid):
        mine_incident_note = MineIncidentNote.find_by_mine_incident_note_guid(
            mine_incident_note_guid)
        if mine_incident_note is None:
            raise NotFound('Mine Incident Note not found')

        return mine_incident_note

    @api.doc(
        description='Delete a Mine Incident Note.',
        params={
            'mine_incident_guid': 'The GUID of the mine incident the note belongs to.',
            'mine_incident_note_guid': 'The GUID of the mine incident note to get.'
        })
    @requires_any_of([MINE_ADMIN, EDIT_INCIDENTS])
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_incident_guid, mine_incident_note_guid):
        mine_incident_note = MineIncidentNote.find_by_mine_incident_note_guid(
            mine_incident_note_guid)
        if mine_incident_note is None:
            raise NotFound('Mine Incident Note not found')

        mine_incident_note.delete()
        return None, 204


class MineIncidentNoteListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'content',
        type=str,
        store_missing=False,
        required=True,
    )

    @api.doc(
        description='Get a list of all notes for a given Mine Incident.',
        params={
            'mine_incident_guid': 'The GUID of the mine incident the note belongs to.',
        })
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(MINE_INCIDENT_NOTE_MODEL, code=200, envelope='records')
    def get(self, mine_incident_guid):
        mine_incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        if mine_incident is None:
            raise NotFound('Mine Incident not found')

        mine_incident_notes = MineIncidentNote.find_by_mine_incident_guid(mine_incident_guid)
        return mine_incident_notes

    @api.doc(
        description='Create a new Mine Incident Note.',
        params={
            'mine_incident_guid': 'The GUID of the mine incident the note belongs to.',
        })
    @api.expect(parser)
    @requires_any_of([MINE_ADMIN, EDIT_INCIDENTS])
    @api.marshal_with(MINE_INCIDENT_NOTE_MODEL, code=201)
    def post(self, mine_incident_guid):
        mine_incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        if mine_incident is None:
            raise NotFound('Mine Incident not found')

        data = self.parser.parse_args()
        note_content = data.get('content')
        if note_content is None or note_content is '':
            raise BadRequest('Mine Incident Note requires "content" to be set')
        mine_incident_note = MineIncidentNote.create(mine_incident, data.get('content'))

        try:
            mine_incident_note.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return mine_incident_note, 201
