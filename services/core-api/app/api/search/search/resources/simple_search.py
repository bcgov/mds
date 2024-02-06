import regex
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask_restx import Resource
from flask import request, current_app

from app.extensions import db, api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.search import simple_search_targets, append_result, execute_search, SearchResult
from app.api.search.response_models import SIMPLE_SEARCH_RESULT_RETURN_MODEL


class SimpleSearchResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(SIMPLE_SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        search_results = []
        app = current_app._get_current_object()

        search_term = request.args.get('search_term', None, type=str)

        # Split incoming search query by space to search by individual words
        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        with ThreadPoolExecutor(max_workers=50) as executor:
            task_list = []
            for type, type_config in simple_search_targets.items():
                task_list.append(
                    executor.submit(execute_search, app, search_results, search_term, search_terms,
                                    type, type_config, 200))
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
        search_results = search_results[0:4]

        return {'search_terms': search_terms, 'search_results': search_results}