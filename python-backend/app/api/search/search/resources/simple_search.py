import regex
from multiprocessing import Process
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import request, current_app
from sqlalchemy import desc, or_, func

from app.extensions import db, api
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.permits.permit.models.permit import Permit
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.utils.access_decorators import requires_role_mine_view
from app.api.utils.search import simple_search_targets, SearchResult
from app.api.search.search_api_models import SIMPLE_SEARCH_RESULT_RETURN_MODEL


class SimpleSearchResource(Resource, UserMixin):
    @requires_role_mine_view
    @api.marshal_with(SIMPLE_SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        search_results = []
        app = current_app._get_current_object()

        search_term = request.args.get('search_term', None, type=str)

        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        with ThreadPoolExecutor(max_workers=50) as executor:
            task_list = []
            for type, type_config in new_search_targets.items():
                task_list.append(
                    executor.submit(type_config[1], app, search_results, search_term, search_terms,
                                    type))
            for task in as_completed(task_list):
                try:
                    data = task.result()
                except Exception as exc:
                    current_app.logger.error(
                        f'generated an exception: {exc} with search term - {search_term}')

        grouped_results = {}
        for result in search_results:
            if (result.result['id'] in grouped_results):
                grouped_results[result.result['id']].score += result.score
            else:
                grouped_results[result.result['id']] = result

        search_results = list(grouped_results.values())
        search_results.sort(key=lambda x: x.score, reverse=True)
        #search_results = search_results.sort(key=lambda x: x.score, reverse=True)
        #search_results = list(grouped_results.values()).sort(key=lambda x: x.score, reverse=True)
        search_results = search_results[0:10]

        return {'search_terms': search_results, 'search_results': search_results}


def append_result(search_results, search_term, type, item, identifier, value, score_multiplier=200):

    if getattr(item, value).lower().startswith(search_term.lower()):
        score_multiplier = score_multiplier * 3

    if getattr(item, value).lower() == search_term.lower():
        score_multiplier = score_multiplier * 10

    search_results.append(
        SearchResult(
            getattr(item, 'score') * score_multiplier, type, {
                'id': getattr(item, identifier),
                'value': getattr(item, value)
            }))


def execute_mine_search(app, search_results, search_term, search_terms, type):
    with app.app_context():
        columns = [Mine.mine_name, Mine.mine_no]
        for term in search_terms:
            for column in columns:
                similarity = db.session.query(Mine).with_entities(
                    func.similarity(column, term).label('score'), Mine.mine_guid, Mine.mine_no,
                    Mine.mine_name).filter(column.ilike(f'{term}%')).order_by(
                        desc(func.similarity(column, term))).all()
                [
                    append_result(search_results, search_term, type, item, 'mine_guid', 'mine_name',
                                  500) for item in similarity
                ]


def execute_party_search(app, search_results, search_term, search_terms, type):
    with app.app_context():
        columns = [Party.first_name, Party.party_name, Party.email, Party.phone_no]
        for term in search_terms:
            for column in columns:
                similarity = db.session.query(Party).with_entities(
                    func.similarity(column, term).label('score'), Party.party_guid,
                    func.concat(Party.first_name, ' ', Party.party_name).label('name'),
                    Party.email).filter(column.ilike(f'{term}%')).order_by(
                        desc(func.similarity(column, term))).all()
                [
                    append_result(search_results, search_term, type, item, 'party_guid', 'name',
                                  200) for item in similarity
                ]


new_search_targets = {
    'mine': ('Mines', execute_mine_search),
    'party': ('Contacts', execute_party_search)
}
