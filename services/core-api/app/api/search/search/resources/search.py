import regex
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask_restx import Resource
from flask import request, current_app

from app.extensions import db, api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin 
from app.api.utils.search import search_targets, append_result, execute_search, SearchResult
from app.api.search.response_models import SEARCH_RESULT_RETURN_MODEL


class SearchOptionsResource(Resource, UserMixin):
    @requires_role_view_all
    def get(self):
        options = []
        for type, type_config in search_targets.items():
            options.append({'model_id': type, 'description': type_config['description']})

        return options


class SearchResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        search_results = []
        app = current_app._get_current_object()

        search_term = request.args.get('search_term', None, type=str)
        search_types = request.args.get('search_types', None, type=str)
        search_types = search_types.split(',') if search_types else search_targets.keys()

        # Split incoming search query by space to search by individual words
        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        with ThreadPoolExecutor(max_workers=50) as executor:
            task_list = []
            for type, type_config in search_targets.items():
                if type in search_types:
                    task_list.append(
                        executor.submit(execute_search, app, search_results, search_term,
                                        search_terms, type, type_config))
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

        top_search_results = list(grouped_results.values())
        top_search_results.sort(key=lambda x: x.score, reverse=True)

        all_search_results = {}

        for type in search_types:
            top_search_results_by_type = {}

            max_results = 5
            if len(search_types) == 1:
                max_results = 50

            for result in top_search_results:
                if len(top_search_results_by_type) > max_results:
                    break
                if result.type == type:
                    top_search_results_by_type[result.result['id']] = result
            if search_targets[type].get('primary_column'):
                full_results = db.session.query(search_targets[type]['model'])\
                    .filter(
                        search_targets[type]['primary_column'].in_(
                            top_search_results_by_type.keys())
                    )\
                    .all()

                for full_result in full_results:
                    top_search_results_by_type[getattr(
                        full_result, search_targets[type]['id_field'])].result = full_result

                all_search_results[type] = list(top_search_results_by_type.values())
            else:
                all_search_results[type] = [res.json() for res in search_results if res.type == type]

        return {'search_terms': search_terms, 'search_results': all_search_results}
