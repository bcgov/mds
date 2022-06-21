from flask_restplus import Namespace
from app.api.notice_of_departure.resources.notice_of_departure_list import NoticeOfDepartureListResource
from app.api.notice_of_departure.resources.notice_of_departure import NoticeOfDepartureResource

api = Namespace('notices-of-departure', description='NOD related operations')

api.add_resource(NoticeOfDepartureListResource, '')

api.add_resource(NoticeOfDepartureResource, '/<string:nod_guid>')
