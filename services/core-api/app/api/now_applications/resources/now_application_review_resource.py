from flask import current_app, request
from flask_restplus import Resource, reqparse, fields, inputs

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_permit, requires_role_view_all
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_review import NOWApplicationReview
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.response_models import NOW_APPLICATION_REVIEW_MDOEL


class NOWApplicationReviewListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'now_application_review_type_code', type=str, help='guid of the mine.', required=True)
    parser.add_argument(
        'response_date', type=inputs.datetime_from_iso8601, help='guid of the mine.')
    parser.add_argument('referee_name', type=str, help='guid of the mine.')

    @api.doc(description='Add new Review to Now Application', params={})
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_REVIEW_MDOEL, code=201)
    def post(self, application_guid):
        now_application = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application:
            raise NotFound('No now_application found')
        if not now_application.now_application_id:
            raise BadRequest('Now Application not imported, call import endpoint first')

        data = self.parser.parse_args()
        new_review = NOWApplicationReview.create(now_application.now_application,
                                                 data['now_application_review_type_code'],
                                                 data.get('response_date'),
                                                 data.get('referee_name'))

        new_documents = request.json.get('uploadedFiles', [])
        if 'uploadedFiles' in request.json.keys():
            del request.json['uploadedFiles']

        for doc in new_documents:
            new_mine_doc = MineDocument(
                mine_guid=now_application.mine_guid,
                document_manager_guid=doc[0],
                document_name=doc[1])

            new_now_mine_doc = NOWApplicationDocumentXref(
                mine_document=new_mine_doc,
                now_application_document_type_code='PUB' if new_review.now_application_review_type_code == 'PUB' else 'REV',
                now_application_id=now_application.now_application.now_application_id,
            )

            new_review.documents.append(new_now_mine_doc)

        new_review.save()

        new_review.save()
        return new_review, 201

    @api.doc(description='Add new Review to Now Application', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_REVIEW_MDOEL, envelope='records', code=201)
    def get(self, application_guid):
        now_application = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application:
            raise NotFound('No now_application found')
        if not now_application.now_application_id:
            raise BadRequest('Now Application not imported, call import endpoint first')

        return now_application.now_application.reviews


class NOWApplicationReviewResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'now_application_review_type_code', type=str, help='guid of the mine.', required=True)
    parser.add_argument(
        'response_date', type=inputs.datetime_from_iso8601, help='guid of the mine.')
    parser.add_argument('referee_name', type=str, help='guid of the mine.')

    @api.doc(description='delete review from Now Application', params={})
    @requires_role_edit_permit
    @api.response(204, 'Successfully deleted.')
    def delete(self, application_guid, now_application_review_id):
        now_app_review = NOWApplicationReview.query.get(now_application_review_id)

        if not now_app_review or str(
                now_app_review.now_application.now_application_guid) != application_guid:
            raise NotFound('No now_application found')

        if len(now_app_review.documents) > 0:
            raise BadRequest('Cannot delete review with documents attached')

        # for doc in now_app_review.documents:
        #     doc.delete()

        now_app_review.delete()
        return ('', 204)

    @api.doc(description='Update Review to Now Application', params={})
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_REVIEW_MDOEL, code=201)
    def put(self, application_guid, now_application_review_id):
        now_app_review = NOWApplicationReview.query.get(now_application_review_id)
        if not now_app_review or str(
                now_app_review.now_application.now_application_guid) != application_guid:
            raise NotFound('No now_application found')

        new_documents = request.json.get('uploadedFiles', [])
        if 'uploadedFiles' in request.json.keys():
            del request.json['uploadedFiles']

        now_app_review.deep_update_from_dict(request.json)

        for doc in new_documents:
            new_mine_doc = MineDocument(
                mine_guid=now_app_review.now_application.mine_guid,
                document_manager_guid=doc[0],
                document_name=doc[1])

            new_now_mine_doc = NOWApplicationDocumentXref(
                mine_document=new_mine_doc,
                now_application_document_type_code='PUB' if now_app_review.now_application_review_type_code == 'PUB' else 'REV',
                now_application_id=now_app_review.now_application_id,
            )

            now_app_review.documents.append(new_now_mine_doc)

        now_app_review.save()

        return now_app_review, 200
