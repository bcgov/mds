import regex
from multiprocessing import Process
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import request, current_app
from sqlalchemy import desc, or_, func

from app.extensions import db
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.permits.permit.models.permit import Permit
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

# 'Description': (description, Id, Model, [Model.attribute, Model.attribute], has_deleted_ind)
common_search_targets = {
    'mine': {
        'model': Mine,
        'primary_column': Mine.mine_guid,
        'description': 'Mines',
        'entities': [Mine.mine_guid, Mine.mine_no, Mine.mine_name],
        'columns': [Mine.mine_name, Mine.mine_no],
        'has_deleted_ind': True,
        'id_field': 'mine_guid',
        'value_field': 'mine_name',
        'score_multiplier': 500
    },
    'party': {
        'model':
        Party,
        'primary_column': Party.party_guid,
        'description':
        'Contacts',
        'entities': [
            Party.party_guid,
            func.concat(Party.first_name, ' ', Party.party_name).label('name'), Party.email
        ],
        'columns': [Party.first_name, Party.party_name, Party.email, Party.phone_no],
        'has_deleted_ind':
        True,
        'id_field':
        'party_guid',
        'value_field':
        'name',
        'score_multiplier':
        150
    }
}

simple_additional_search_targets = {
    'permit': {
        'model': Permit,
        'primary_column': Permit.permit_guid,
        'description': 'Permits',
        'entities': [Permit.permit_guid, Permit.mine_guid, Permit.permit_no],
        'columns': [Permit.permit_no],
        'has_deleted_ind': False,
        'id_field': 'mine_guid',
        'value_field': 'permit_no',
        'score_multiplier': 1000
    }
}

full_additional_search_targets = {
    'permit': {
        'model': Permit,
        'primary_column': Permit.permit_guid,
        'description': 'Permits',
        'entities': [Permit.permit_guid, Permit.permit_no],
        'columns': [Permit.permit_no],
        'has_deleted_ind': False,
        'id_field': 'permit_guid',
        'value_field': 'permit_no',
        'score_multiplier': 1000
    },
    'mine_documents': {
        'model': MineDocument,
        'primary_column': MineDocument.mine_document_guid,
        'description': 'Mine Documents',
        'entities': [MineDocument.mine_document_guid, MineDocument.document_name],
        'columns': [MineDocument.document_name],
        'has_deleted_ind': False,
        'id_field': 'mine_document_guid',
        'value_field': 'document_name',
        'score_multiplier': 250
    },
    'permit_documents': {
        'model': PermitAmendmentDocument,
        'primary_column': PermitAmendmentDocument.permit_amendment_document_guid,
        'description': 'Permits',
        'entities': [PermitAmendmentDocument.permit_amendment_document_guid, PermitAmendmentDocument.document_name],
        'columns': [PermitAmendmentDocument.document_name],
        'has_deleted_ind': False,
        'id_field': 'permit_amendment_document_guid',
        'value_field': 'document_name',
        'score_multiplier': 250
    }
}

simple_search_targets = dict(**common_search_targets, **simple_additional_search_targets)
search_targets = dict(**common_search_targets, **full_additional_search_targets)


class SearchResult:
    def __init__(self, score, type, result):
        self.score = score
        self.type = type
        self.result = result

    def json(self):
        return {'score': self.score, 'type': self.type, 'result': self.result}
