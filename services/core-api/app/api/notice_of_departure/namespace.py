from flask_restx import Namespace
from app.api.notice_of_departure.resources.notice_of_departure_list import NoticeOfDepartureListResource
from app.api.notice_of_departure.resources.notice_of_departure import NoticeOfDepartureResource
from app.api.notice_of_departure.resources.notice_of_departure_document import MineNoticeOfDepartureDocumentUploadResource, MineNoticeOfDepartureDocumentResource

api = Namespace('notices-of-departure', description='NOD related operations')

api.add_resource(NoticeOfDepartureListResource, '')

api.add_resource(NoticeOfDepartureResource, '/<string:nod_guid>')

api.add_resource(MineNoticeOfDepartureDocumentUploadResource, '/<string:nod_guid>/documents')

api.add_resource(MineNoticeOfDepartureDocumentResource,
                 '/<string:nod_guid>/documents/<string:docman_guid>')
