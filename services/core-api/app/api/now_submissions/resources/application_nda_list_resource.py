from flask_restplus import Resource
from flask import request, current_app
from sqlalchemy import desc, func, or_
from marshmallow.exceptions import MarshmallowError
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.now_submissions.models.application_nda import ApplicationNDA
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.mines.mine.models.mine import Mine
from app.api.now_submissions.response_models import APPLICATIONNDA
from app.api.utils.access_decorators import requires_role_edit_submissions
from app.api.utils.resources_mixins import UserMixin


class ApplicationNDAListResource(Resource, UserMixin):
    @api.doc(description='Save an application nda')
    @requires_role_edit_submissions
    @api.expect(APPLICATIONNDA)
    @api.marshal_with(APPLICATIONNDA, code=201)
    def post(self):
        try:
            application_nda = ApplicationNDA._schema().load(request.json)
        except MarshmallowError as e:
            raise BadRequest(e)

        if application_nda.application_nda_guid is not None:
            raise BadRequest(f'messageid: {application_nda.messageid} already exists.')

        if application_nda.applicant.clientid == application_nda.submitter.clientid:
            application_nda.submitter = application_nda.applicant

        mine = Mine.find_by_mine_no(application_nda.minenumber)

        if mine is None:
            raise BadRequest('Mine not found from the minenumber supplied.')

        application_nda.mine_guid = mine.mine_guid
        application_nda.nownumber = NOWApplicationIdentity.create_now_number(mine)

        application_nda.save()
        return application_nda, 201
