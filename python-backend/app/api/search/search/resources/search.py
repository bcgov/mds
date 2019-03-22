import regex
from multiprocessing import Process
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import request, current_app

from app.extensions import db
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.permits.permit.models.permit import Permit

# 'TYPE': (Model, [Model.attribute, Model.attribute], has_deleted_ind, json_function, json_function_arguements)
search_targets = {
    'MINE': (Mine, [Mine.mine_name, Mine.mine_no], True, 'json_for_list', 'guid', []),
    'CONTACT': (Party, [Party.first_name, Party.party_name, Party.email], False, 'json',
                'party_guid', [True, ['mine_party_appt']]),
    'PERMIT': (Permit, [Permit.permit_no], False, 'json_for_list', 'permit_guid', [])
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
        search_process = []
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
                        executor.submit(execute_search, app, search_results, term, type,
                                        type_config[0], type_config[1], type_config[2],
                                        type_config[3], type_config[4], *type_config[5]))
                    for task in as_completed(task_list):
                        try:
                            data = task.result()
                        except Exception as exc:
                            current_app.logger.error(
                                f'generated an exception: {exc} with search term - {search_term}')

        # for term in search_terms:
        #     for type, type_config in search_targets.items():
        #         search_process.append(
        #             Process(
        #                 target=execute_search,
        #                 args=(app, search_results, term, type, type_config[0], type_config[1],
        #                       type_config[2], type_config[3], *type_config[4])))

        # for proc in search_process:
        #     proc.start()

        # for proc in search_process:
        #     proc.join()

        search_results.sort(key=lambda x: x.score, reverse=True)

        return {'search_terms': search_terms, 'search_results': [y.json() for y in search_results]}


def execute_search(app, search_results, term, type, model, columns, has_deleted_ind,
                   json_function_name, comparator, *json_function_args):
    with app.app_context():
        for column in columns:
            exact = db.session.query(model).filter(column.ilike(term))
            starts_with = db.session.query(model).filter(column.ilike(f'{term}%'))
            contains = db.session.query(model).filter(column.ilike(f'%{term}%'))
            #fuzzy = model.query.filter(
            #    text(f'{column}=={search_term}')

            if has_deleted_ind:
                exact = exact.filter_by(deleted_ind=False)
                starts_with = starts_with.filter_by(deleted_ind=False)
                contains = contains.filter_by(deleted_ind=False)

            contains = contains.limit(5)
            starts_with = starts_with.limit(5)
            exact = exact.limit(5)

            for x in exact:
                search_results.append(
                    SearchResult(100, type,
                                 getattr(x, json_function_name)(*json_function_args)))

            for item in starts_with:
                in_list = False
                for item2 in search_results:
                    if str(getattr(item, comparator)) == str(item2.result.get(comparator)):
                        in_list = True
                if not in_list:
                    search_results.append(
                        SearchResult(50, type,
                                     getattr(item, json_function_name)(*json_function_args)))

            for item in contains:
                in_list = False
                for item2 in search_results:
                    if str(getattr(item, comparator)) == str(item2.result.get(comparator)):
                        in_list = True
                if not in_list:
                    search_results.append(
                        SearchResult(25, type,
                                     getattr(item, json_function_name)(*json_function_args)))

            # for x in exact:
            #     search_results.append(
            #         SearchResult(100, type,
            #                      getattr(x, json_function_name)(*json_function_args)))
            # for x in starts_with:
            #     search_results.append(
            #         SearchResult(50, type,
            #                      getattr(x, json_function_name)(*json_function_args)))
            # for x in contains:
            #     search_results.append(
            #         SearchResult(25, type,
            #                      getattr(x, json_function_name)(*json_function_args)))
