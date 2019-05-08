import regex
from multiprocessing import Process
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import request, current_app
from sqlalchemy import desc, or_

from app.extensions import db
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.permits.permit.models.permit import Permit
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

# 'Description': (description, Id, Model, [Model.attribute, Model.attribute], has_deleted_ind)
search_targets = {
    'mine': ('Mines', 'mine_guid', Mine, [Mine.mine_name, Mine.mine_no], True, 'mine_name'),
    'party': ('Contacts', 'party_guid', Party,
              [Party.first_name, Party.party_name, Party.email, Party.phone_no], False, 'name'),
    'permit': ('Permits', 'permit_guid', Permit, [Permit.permit_no], False, 'permit_no'),
    'mine_documents': ('Mine Documents', 'mine_document_guid', MineDocument,
                       [MineDocument.document_name], False, 'document_name'),
    'permit_documents': ('Permit Documents', 'document_guid', PermitAmendmentDocument,
                         [PermitAmendmentDocument.document_name], False, 'document_name')
}


class SearchResult:
    def __init__(self, score, type, result):
        self.score = score
        self.type = type
        self.result = result

    def json(self):
        return {'score': self.score, 'type': self.type, 'result': self.result}
