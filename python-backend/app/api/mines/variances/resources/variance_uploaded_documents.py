from werkzeug.exceptions import NotFound

from flask_restplus import Resource
from app.extensions import api

from ...mine.models.mine import Mine
from app.api.mines.documents.mines.models.mine_document import MineDocument
from ....utils.access_decorators import (requires_any_of, EDIT_VARIANCE,
                                         MINESPACE_PROPONENT)
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.variances.models.variance import Variance


class MineVarianceUploadedDocumentsResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Delete a document from a variance.')
    @requires_any_of([EDIT_VARIANCE, MINESPACE_PROPONENT])
    def delete(self, mine_guid, variance_guid, mine_document_guid):
        variance = Variance.find_by_mine_guid_and_variance_guid(
            mine_guid, variance_guid)
        mine_document = MineDocument.find_by_mine_document_guid(
            mine_document_guid)

        if variance is None:
            raise NotFound('Variance not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')
        if mine_document not in variance.mine_documents:
            raise NotFound('Mine document not found on variance.')

        variance.mine_documents.remove(mine_document)
        variance.save()

        return ('', 204)
