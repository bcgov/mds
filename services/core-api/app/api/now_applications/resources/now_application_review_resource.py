from flask import current_app, request
from flask_restx import Resource, reqparse, fields, inputs

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_permit, requires_role_view_all
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_review import NOWApplicationReview
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.response_models import NOW_APPLICATION_REVIEW_MODEL

import time

class NOWApplicationReviewListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'now_application_review_type_code', type=str, help='Type of Review', required=True)
    parser.add_argument('now_application_document_type_code', type=str, help='Type of document')
    parser.add_argument('response_date', type=inputs.datetime_from_iso8601, help='Date of Response')
    parser.add_argument('referee_name', type=str, help='Name of Referee')
    parser.add_argument('referral_number', type=str, help='referral number for E-Referral')
    parser.add_argument('response_url', type=str, help='CRTS URL')

    @api.doc(description='Add new Review to Now Application', params={})
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_REVIEW_MODEL, code=201)
    def post(self, application_guid):
        current_app.logger.info('[MDS-5629][%s] - Creating Review List for application_guid: %s', self.__class__.__name__,
                                application_guid)
        now_application = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application:
            raise NotFound('No now_application found')
        if not now_application.now_application_id:
            raise BadRequest('Now Application not imported, call import endpoint first')

        current_app.logger.info('[MDS-5629][%s] - Found NOWApplication with now_application_id: %s',
                                self.__class__.__name__, now_application.now_application_id)
        data = self.parser.parse_args()
        new_review = NOWApplicationReview.create(now_application.now_application,
                                                 data['now_application_review_type_code'],
                                                 data.get('response_date'),
                                                 data.get('referee_name'),
                                                 data.get('referral_number'),
                                                 data.get('response_url'))
        current_app.logger.info('[MDS-5629][%s] - new_review created', self.__class__.__name__)
        new_documents = request.json.get('uploadedFiles', [])
        current_app.logger.info('[MDS-5629][%s] - Found %s documents to append to NoWReview', self.__class__.__name__, len(new_documents))
        if 'uploadedFiles' in request.json.keys():
            del request.json['uploadedFiles']

        for doc in new_documents:
            new_mine_doc = MineDocument(
                mine_guid=now_application.mine_guid,
                document_manager_guid=doc[0],
                document_name=doc[1])
            current_app.logger.info('[MDS-5629][%s] - new_mine_doc created' \
                                    '\nmine_guid: %s' \
                                    '\ndocument_manager_guid: %s' \
                                    '\ndocument_name: %s',
                                    self.__class__.__name__, now_application.mine_guid, doc[0], doc[1])
            new_now_mine_doc = NOWApplicationDocumentXref(
                mine_document=new_mine_doc,
                now_application_document_type_code=data['now_application_document_type_code'],
                now_application_id=now_application.now_application.now_application_id,
            )

            new_review.documents.append(new_now_mine_doc)

        new_review.save()
        current_app.logger.info('[MDS-5629][%s] - new_review saved', self.__class__.__name__,)
        return new_review, 201

    @api.doc(description='Add new Review to Now Application', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_REVIEW_MODEL, envelope='records', code=201)
    def get(self, application_guid):
        now_application = NOWApplicationIdentity.find_by_guid(application_guid)
        current_app.logger.info("[MDS-5629][%s] - Retrieving review for application_guid: %s", self.__class__.__name__, application_guid)
        if not now_application:
            raise NotFound('No now_application found')
        if not now_application.now_application_id:
            raise BadRequest('Now Application not imported, call import endpoint first')

        reviews = now_application.now_application.reviews
        current_app.logger.info('[MDS-5629][%s] - Returning : %s reviews', self.__class__.__name__, len(reviews))
        return reviews


class NOWApplicationReviewResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'now_application_review_type_code', type=str, help='Type of Review', required=True)
    parser.add_argument('now_application_document_type_code', type=str, help='Type of document')
    parser.add_argument('response_date', type=inputs.datetime_from_iso8601, help='Date of Response')
    parser.add_argument('referee_name', type=str, help='Name of Referee')
    parser.add_argument('referral_number', type=str, help='referral number for E-Referral')

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
    @api.marshal_with(NOW_APPLICATION_REVIEW_MODEL, code=201)
    def put(self, application_guid, now_application_review_id):
        data = self.parser.parse_args()
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
                now_application_document_type_code=data['now_application_document_type_code'],
                now_application_id=now_app_review.now_application_id,
            )

            now_app_review.documents.append(new_now_mine_doc)

        now_app_review.save()

        return now_app_review, 200
