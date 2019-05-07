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
from app.api.utils.search import search_targets, SearchResult


class SimpleSearchResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('search_term', type=str, help='Search term.', location='json')
    parser.add_argument('search_types', type=str, help='Search types.', location='json')

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
                        executor.submit(execute_simple_search, app, search_results, term,
                                        type_config[0], type_config[1], type_config[2],
                                        type_config[3], type_config[4], type_config[5],
                                        *type_config[6]))
                    for task in as_completed(task_list):
                        try:
                            data = task.result()
                        except Exception as exc:
                            current_app.logger.error(
                                f'generated an exception: {exc} with search term - {search_term}')

        search_results.sort(key=lambda x: x.score, reverse=True)

        return {'search_terms': search_terms, 'search_results': [y.json() for y in search_results]}


def execute_simple_search(app, search_results, term, type, comparator, model, columns,
                          has_deleted_ind, json_function_name, *json_function_args):
    with app.app_context():

        columns_for_starts = [column.ilike(f'{term}%') for column in columns]

        starts_with = db.session.query(model).filter(or_(*columns_for_starts))

        if has_deleted_ind:
            starts_with = starts_with.filter_by(deleted_ind=False)

        starts_with = starts_with.order_by(desc(model.create_timestamp)).limit(10).all()

        for item in starts_with:
            search_results.append(
                SearchResult(75, type,
                             getattr(item, json_function_name)(*json_function_args)))
