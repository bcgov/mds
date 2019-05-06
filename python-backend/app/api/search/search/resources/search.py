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
from app.api.utils.access_decorators import requires_role_mine_view

# 'Description': (description, Id, Model, [Model.attribute, Model.attribute], has_deleted_ind, json_function, json_function_arguements)
search_targets = {
    'mine': ('Mines', 'mine_guid', Mine, [Mine.mine_name, Mine.mine_no], True, 'json_for_list', []),
    'party': ('Contacts', 'party_guid', Party,
              [Party.first_name, Party.party_name, Party.email,
               Party.phone_no], False, 'json', [True, ['mine_party_appt']]),
    'permit': ('Permits', 'permit_guid', Permit, [Permit.permit_no], False, 'json_for_list', []),
    'mine_documents': ('Mine Documents', 'mine_document_guid', MineDocument,
                       [MineDocument.document_name], False, 'json', []),
    'permit_documents': ('Permit Documents', 'document_guid', PermitAmendmentDocument,
                         [PermitAmendmentDocument.document_name], False, 'json', [])
}


class SearchResult:
    def __init__(self, score, type, result):
        self.score = score
        self.type = type
        self.result = result

    def json(self):
        return {'score': self.score, 'type': self.type, 'result': self.result}


class SearchOptionsResource(Resource, UserMixin):
    
    @requires_role_mine_view
    def get(self):
        options = []
        for key, value in search_targets.items():
            options.append({'model_id': key, 'description': value[0]})

        return options


class SearchResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('search_term', type=str, help='Search term.')
    parser.add_argument('search_types', type=str, help='Search types.')

    #@requires_role_mine_view
    def get(self):
        search_results = []
        app = current_app._get_current_object()

        search_term = request.args.get('search_term', None, type=str)
        search_types = request.args.get('search_types', None, type=str)
        search_types = search_types.split(',') if search_types else []

        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        with ThreadPoolExecutor(max_workers=50) as executor:
            task_list = []
            for term in search_terms:
                for type, type_config in search_targets.items():
                    task_list.append(
                        executor.submit(execute_search, app, search_results, term, type_config[0],
                                        type_config[1], type_config[2], type_config[3],
                                        type_config[4], type_config[5], *type_config[6]))
                    for task in as_completed(task_list):
                        try:
                            data = task.result()
                        except Exception as exc:
                            current_app.logger.error(
                                f'generated an exception: {exc} with search term - {search_term}')

        search_results.sort(key=lambda x: x.score, reverse=True)

        return {'search_terms': search_terms, 'search_results': [y.json() for y in search_results]}


def execute_search(app, search_results, term, type, comparator, model, columns, has_deleted_ind,
                   json_function_name, *json_function_args):
    with app.app_context():
        columns_for_exact = [column.ilike(term) for column in columns]
        columns_for_starts = [column.ilike(f'{term}%') for column in columns]
        columns_for_contains = [column.ilike(f'%{term}%') for column in columns]

        exact = db.session.query(model).filter(or_(*columns_for_exact))
        starts_with = db.session.query(model).filter(or_(*columns_for_starts))
        contains = db.session.query(model).filter(or_(*columns_for_contains))
        #fuzzy? Soundex?

        if has_deleted_ind:
            exact = exact.filter_by(deleted_ind=False)
            starts_with = starts_with.filter_by(deleted_ind=False)
            contains = contains.filter_by(deleted_ind=False)

        contains = contains.order_by(desc(model.create_timestamp)).limit(25).all()
        starts_with = starts_with.order_by(desc(model.create_timestamp)).limit(25).all()
        exact = exact.order_by(desc(model.create_timestamp)).limit(50).all()
        app.logger.info(str(exact))
        for item in exact:
            search_results.append(
                SearchResult(500, type,
                             getattr(item, json_function_name)(*json_function_args)))

        for item in starts_with:
            in_list = False
            for item2 in search_results:
                if getattr(item, json_function_name)(*json_function_args).get(comparator) == str(
                        item2.result.get(comparator)):
                    in_list = True
            if not in_list:
                search_results.append(
                    SearchResult(75, type,
                                 getattr(item, json_function_name)(*json_function_args)))

        for item in contains:
            in_list = False
            for item2 in search_results:
                if getattr(item, json_function_name)(*json_function_args).get(comparator) == str(
                        item2.result.get(comparator)):
                    in_list = True
            if not in_list:
                search_results.append(
                    SearchResult(25, type,
                                 getattr(item, json_function_name)(*json_function_args)))
