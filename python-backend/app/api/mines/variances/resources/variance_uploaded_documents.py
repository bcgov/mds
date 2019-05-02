from werkzeug.exceptions import NotFound

from flask_restplus import Resource
from app.extensions import api

from ..models.variance import Variance
from ...mine.models.mine import Mine
from ....documents.mines.models.mine_document import MineDocument
from ....utils.access_decorators import (requires_any_of, MINE_CREATE,
                                         MINESPACE_PROPONENT)
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser


class VarianceUploadedDocumentsResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Delete a document from a variance.')
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, mine_guid, variance_id, mine_document_guid):
        variance = Variance.find_by_mine_guid_and_variance_id(mine_guid, variance_id)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if variance is None:
            raise NotFound('Variance not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')

        variance.documents.remove(mine_document)
        variance.save()

        return ('', 204)
