import regex
from multiprocessing import Process
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import request, current_app
from sqlalchemy import desc, or_
from flask_restplus import fields

from app.extensions import db, api
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.permits.permit.models.permit import Permit
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.utils.access_decorators import requires_role_mine_view
from app.api.utils.search import search_targets, SearchResult
from app.api.search.search_api_models import SEARCH_RESULT_RETURN_MODEL


class SearchOptionsResource(Resource, UserMixin):
    @requires_role_mine_view
    def get(self):
        options = []
        for key, value in search_targets.items():
            options.append({'model_id': key, 'description': value[0]})

        return options


class SearchResource(Resource, UserMixin):
    @requires_role_mine_view
    @api.marshal_with(SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        all_search_results = {}
        app = current_app._get_current_object()

        search_term = request.args.get('search_term', None, type=str)
        search_types = request.args.get('search_types', None, type=str)
        search_types = search_types.split(',') if search_types else search_targets.keys()

        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        for type, type_config in search_targets.items():
            if type in search_types:
                type_results = []
                comparator = type_config[1]
                model = type_config[2]
                columns = type_config[3]
                has_deleted_ind = type_config[4]
                for term in search_terms:
                    term_results = []

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

                    for item in exact:
                        term_results.append(SearchResult(500, type, item))

                    for item in starts_with:
                        in_list = False
                        for item2 in term_results:
                            if getattr(item, comparator) == getattr(item2.result, comparator):
                                in_list = True
                        if not in_list:
                            term_results.append(SearchResult(75, type, item))

                    for item in contains:
                        in_list = False
                        for item2 in term_results:
                            if getattr(item, comparator) == getattr(item2.result, comparator):
                                in_list = True
                        if not in_list:
                            term_results.append(SearchResult(25, type, item))

                    type_results += term_results

                type_results.sort(key=lambda x: x.score, reverse=True)
                all_search_results[type] = type_results

        return {'search_terms': search_terms, 'search_results': all_search_results}
