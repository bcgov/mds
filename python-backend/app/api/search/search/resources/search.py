from threading import Thread

from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request

from app.extensions import api
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.permits.permit.models.permit import Permit

# 'TYPE': (Model, [Model.attribute, Model.attribute], has_deleted_ind, json_function, json_function_arguements)
search_targets = {
    'MINE': (Mine, [Mine.mine_name, Mine.mine_no], True, 'json_for_list', []),
    'CONTACT': (Party, [Party.first_name, Party.party_name, Party.email], False, 'json',
                [True, ['mine_party_appt']]),
    'PERMIT': (Permit, [Permit.permit_no], False, 'json_for_list', [])
}


class SearchResult:
    def __init__(self, score, type, result):
        self.score = score
        self.type = type
        self.result = result

    def json(self):
        return {'score': self.score, 'type': self.type, 'result': self.result}


class SearchResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('search_term', type=str, help='Search term.')
    parser.add_argument('search_types', type=str, help='Search types.')

    #Split search term on space?

    #@requires_role_mine_view
    def get(self):
        search_results = []

        search_term = request.args.get('search_term', None, type=str)    
        search_types = request.args.get('search_types', None, type=str)
        search_types = search_types.split(',') if search_types else []


        for type, type_config in search_targets.items():
            search_results = search_results + execute_search(
                search_term, type, type_config[0], type_config[1], type_config[2], type_config[3],
                *type_config[4])

        #thread = Thread(target=lambda: results.append(number))
        #search_threads = [
        #    Thread(
        #        target=execute_search,
        #        args=(search_results, search_term, type, type_config[0], type_config[1],
        #              type_config[2], type_config[3], *type_config[4]))
        #    for type, type_config in search_targets.items()
        #]

        #for thread in search_threads:
        #    thread.start()

        #for thread in search_threads:
        #    thread.join()

        search_results.sort(key=lambda x: x.score, reverse=True)

        return {'search_results': [y.json() for y in search_results]}


def execute_search(search_term, type, model, columns, has_deleted_ind, json_function_name,
                   *json_function_args):
    results = []
    for column in columns:
        exact = model.query.filter(column.ilike(search_term))
        starts_with = model.query.filter(column.ilike(f'{search_term}%'))
        contains = model.query.filter(column.ilike(f'%{search_term}%'))
        #fuzzy = model.query.filter(
        #    text(f'{column}=={search_term}')

        if has_deleted_ind:
            exact = exact.filter_by(deleted_ind=False)
            starts_with = starts_with.filter_by(deleted_ind=False)
            contains = contains.filter_by(deleted_ind=False)

        for x in exact.limit(5):
            results.append(
                SearchResult(100, type,
                             getattr(x, json_function_name)(*json_function_args)))
        for x in starts_with.limit(5):
            results.append(
                SearchResult(50, type,
                             getattr(x, json_function_name)(*json_function_args)))
        for x in contains.limit(5):
            results.append(
                SearchResult(25, type,
                             getattr(x, json_function_name)(*json_function_args)))

    return results