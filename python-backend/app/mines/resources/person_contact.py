from datetime import datetime, timedelta
import uuid

from flask_restplus import Resource, reqparse
from ..models.mines import MineIdentity
from ..models.person import Person, MgrAppointment, PersonContactResource

from app.extensions import jwt


class PersonContactResource(Resource):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, person_contact_guid):
        person = PersonContactResource.find_by_person_contact_guid(person_contact_guid)
        if person:
            return person.json()
        return {'message': 'Person not found'}, 404
