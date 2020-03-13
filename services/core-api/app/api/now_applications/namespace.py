from flask_restplus import Namespace

from app.api.now_applications.resources.now_application_import_resource import NOWApplicationImportResource
from app.api.now_applications.resources.now_application_resource import NOWApplicationResource
from app.api.now_applications.resources.now_application_list_resource import NOWApplicationListResource
from app.api.now_applications.resources.now_activity_type_resource import NOWActivityTypeResource
from app.api.now_applications.resources.now_application_type_resource import NOWApplicationTypeResource
from app.api.now_applications.resources.now_application_status_code_resource import NOWApplicationStatusCodeResource
from app.api.now_applications.resources.unit_type_resource import UnitTypeResource
from app.api.now_applications.resources.now_application_document_type_resource import NOWApplicationDocumentTypeResource, NOWApplicationDocumentTypeListResource, NOWApplicationDocumentGenerateResource
from app.api.now_applications.resources.underground_exploration_type_resource import UndergroundExplorationTypeResource
from app.api.now_applications.resources.now_application_progress_resource import NOWApplicationProgressResource
from app.api.now_applications.resources.now_application_progress_status_resource import NOWApplicationProgressStatusResource
from app.api.now_applications.resources.now_application_document_resource import NOWApplicationDocumentResource, NOWApplicationDocumentUploadResource
from app.api.now_applications.resources.now_application_permit_type_resource import NOWApplicationPermitTypeResource
from app.api.now_applications.resources.now_application_review_resource import NOWApplicationReviewListResource, NOWApplicationReviewResource
from app.api.now_applications.resources.now_application_review_type_resource import NOWApplicationReviewTypeResource

api = Namespace('now-applications', description='Core Notice of Work operations')

api.add_resource(NOWApplicationListResource, '')
api.add_resource(NOWApplicationImportResource, '/<string:application_guid>/import')
api.add_resource(NOWApplicationResource, '/<string:application_guid>')
api.add_resource(NOWApplicationProgressResource, '/<string:application_guid>/progress')
api.add_resource(NOWApplicationReviewListResource, '/<string:application_guid>/reviews')
api.add_resource(NOWApplicationReviewResource,
                 '/<string:application_guid>/reviews/<int:now_application_review_id>')
api.add_resource(NOWApplicationDocumentUploadResource, '/<string:application_guid>/document')
api.add_resource(NOWApplicationDocumentResource,
                 '/<string:application_guid>/document/<string:mine_document_guid>')
api.add_resource(NOWApplicationDocumentGenerateResource,
                 '/application-document-types/<string:document_type_code>/generate')

# now static content
api.add_resource(NOWActivityTypeResource, '/activity-types')
api.add_resource(NOWApplicationTypeResource, '/application-types')
api.add_resource(NOWApplicationStatusCodeResource, '/application-status-codes')
api.add_resource(UnitTypeResource, '/unit-types')
api.add_resource(NOWApplicationDocumentTypeListResource, '/application-document-types')
api.add_resource(NOWApplicationDocumentTypeResource,
                 '/application-document-types/<string:document_type_code>')
api.add_resource(UndergroundExplorationTypeResource, '/underground-exploration-types')
api.add_resource(NOWApplicationProgressStatusResource, '/application-progress-status-codes')
api.add_resource(NOWApplicationPermitTypeResource, '/application-permit-types')
api.add_resource(NOWApplicationReviewTypeResource, '/review-types')