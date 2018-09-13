from datetime import datetime, timedelta
import uuid

from flask_restplus import Resource, reqparse
from ..models.mines import MineIdentity
from ..models.person import Person, MgrAppointment
from app.extensions import jwt
from .mixins import UserMixin


class PersonResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('first_name', type=str)
    parser.add_argument('surname', type=str)
    parser.add_argument('phone_no', type=str)
    parser.add_argument('phone_ext', type=str)
    parser.add_argument('email', type=str)

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, person_guid):
        person = Person.find_by_person_guid(person_guid)
        if person:
            return person.json()
        return {'message': 'Person not found'}, 404

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, person_guid=None):
        if person_guid:
            return {'error': 'Unexpected person id in Url.'}, 400
        data = PersonResource.parser.parse_args()
        if not data['first_name']:
            return {'error': 'Must specify a first name.'}, 400
        if not data['surname']:
            return {'error': 'Must specify a surname.'}, 400
        if not data['phone_no']:
            return {'error': 'Must specify a phone number.'}, 400
        if not data['email']:
            return {'error': 'Must specify an email.'}, 400
        person_exists = Person.find_by_name(data['first_name'], data['surname'])
        if person_exists:
            return {'error': 'Person with the name: {} {} already exists'.format(data['first_name'], data['surname'])}, 400
        person = Person(
            person_guid=uuid.uuid4(),
            first_name=data['first_name'],
            surname=data['surname'],
            phone_no=data['phone_no'],
            email=data['email'],
            phone_ext=data['phone_ext'] if data['phone_ext'] else '',
            **self.get_create_update_dict()
        )
        person.save()
        return person.json()

    @jwt.requires_roles(["mds-mine-create"])
    def put(self, person_guid):
        data = PersonResource.parser.parse_args()
        person_exists = Person.find_by_person_guid(person_guid)
        if not person_exists:
            return {'message': 'Person not found'}, 404

        first_name = data['first_name'] if data['first_name'] else person_exists.first_name
        surname = data['surname'] if data['surname'] else person_exists.surname
        person_name_exists = Person.find_by_name(first_name, surname)
        if person_name_exists:
            return {'error': 'Person with the name: {} {} already exists'.format(first_name, surname)}, 400
        person_exists.first_name = first_name
        person_exists.surname = surname
        person_exists.save()
        return person_exists.json()


class ManagerResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('person_guid', type=str)
    parser.add_argument('mine_guid', type=str)
    parser.add_argument('effective_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mgr_appointment_guid):
        manager = MgrAppointment.find_by_mgr_appointment_guid(mgr_appointment_guid)
        if manager:
            return manager.json()
        return {'message': 'Manager not found'}, 404

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mgr_appointment_guid=None):
        if mgr_appointment_guid:
            return {'error': 'Unexpected manager id in Url.'}, 400
        data = ManagerResource.parser.parse_args()
        if not data['person_guid']:
            return {'error': 'Must specify a person guid.'}, 400
        if not data['mine_guid']:
            return {'error': 'Must specify a mine guid.'}, 400
        if not data['effective_date']:
            return {'error': 'Must specify a effective_date.'}, 400
        # Validation for mine and person exists
        person_exists = Person.find_by_person_guid(data['person_guid'])
        if not person_exists:
            return {'error': 'Person with guid: {}, does not exist.'.format(data['person_guid'])}, 400
        mine_exists = MineIdentity.find_by_mine_guid(data['mine_guid'])
        if not mine_exists:
            return {'error': 'Mine with guid: {}, does not exist.'.format(data['mine_guid'])}, 400
        # Check if there is a previous manager, set expiry the day before new manager
        previous_mgr_expiry_date = data['effective_date'] - timedelta(days=1)
        previous_mgrs = mine_exists.mgr_appointment
        if previous_mgrs:
            previous_mgr_info = previous_mgrs[0]
            previous_mgr = MgrAppointment.find_by_mgr_appointment_guid(previous_mgr_info.mgr_appointment_guid)
            previous_mgr.expiry_date = previous_mgr_expiry_date
            previous_mgr.save()

        manager = MgrAppointment(
            mgr_appointment_guid=uuid.uuid4(),
            person_guid=data['person_guid'],
            mine_guid=data['mine_guid'],
            effective_date=data['effective_date'],
            **self.get_create_update_dict()
        )
        manager.save()
        return {
            'person_guid': str(manager.person_guid),
            'mgr_appointment_guid': str(manager.mgr_appointment_guid),
            'mine_guid': str(manager.mine_guid),
            'first_name': person_exists.first_name,
            'surname': person_exists.surname,
            'full_name': person_exists.first_name + ' ' + person_exists.surname
        }


class PersonList(Resource):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        return {'persons': list(map(lambda x: x.json(), Person.query.all()))}
