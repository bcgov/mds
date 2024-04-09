from flask_restx import Namespace

from app.api.now_applications.resources.now_application_import_resource import NOWApplicationImportResource
from app.api.now_applications.resources.now_application_now_numbers_list_resource import \
    NOWApplicationNOWNumbersListResource
from app.api.now_applications.resources.now_application_resource import NOWApplicationResource
from app.api.now_applications.resources.now_application_list_resource import NOWApplicationListResource
from app.api.now_applications.resources.now_activity_type_resource import NOWActivityTypeResource
from app.api.now_applications.resources.now_application_type_resource import NOWApplicationTypeResource
from app.api.now_applications.resources.now_application_status_resource import NOWApplicationStatusCodeResource, NOWApplicationStatusResource
from app.api.now_applications.resources.now_application_delay_resource import NOWApplicationDelayResource, NOWApplicationDelayListResource, NOWApplicationDelayTypeResource
from app.api.now_applications.resources.now_application_status_resource import NOWApplicationStatusResource
from app.api.now_applications.resources.unit_type_resource import UnitTypeResource
from app.api.now_applications.resources.now_application_document_type_resource import NOWApplicationDocumentTypeResource, NOWApplicationDocumentTypeListResource, NOWApplicationDocumentGenerateResource
from app.api.now_applications.resources.underground_exploration_type_resource import UndergroundExplorationTypeResource
from app.api.now_applications.resources.now_application_progress_resource import NOWApplicationProgressResource
from app.api.now_applications.resources.now_application_progress_status_resource import NOWApplicationProgressStatusResource
from app.api.now_applications.resources.now_application_document_resource import NOWApplicationDocumentResource, NOWApplicationDocumentUploadResource, NOWApplicationDocumentSortResource, NOWApplicationDocumentIdentityResource
from app.api.now_applications.resources.now_application_permit_type_resource import NOWApplicationPermitTypeResource
from app.api.now_applications.resources.now_application_review_resource import NOWApplicationReviewListResource, NOWApplicationReviewResource
from app.api.now_applications.resources.now_application_review_type_resource import NOWApplicationReviewTypeResource
from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
from app.api.now_applications.resources.administrative_amendment_list_resource import AdministrativeAmendmentListResource
from app.api.now_applications.resources.now_application_import_submission_documents_job import NOWApplicationImportSubmissionDocumentsJobResource

api = Namespace('now-applications', description='Core Notice of Work operations')

api.add_resource(NOWApplicationListResource, '')
api.add_resource(NOWApplicationNOWNumbersListResource, '/now-numbers')
api.add_resource(NOWApplicationImportResource, '/<string:application_guid>/import')
api.add_resource(NOWApplicationImportSubmissionDocumentsJobResource,
                 '/<string:application_guid>/import-submission-documents-job')
api.add_resource(NOWApplicationStatusResource, '/<string:application_guid>/status')
api.add_resource(NOWApplicationResource, '/<string:application_guid>')
api.add_resource(NOWApplicationProgressResource,
                 '/<string:application_guid>/progress/<string:application_progress_status_code>')
api.add_resource(NOWApplicationReviewListResource, '/<string:application_guid>/reviews')
api.add_resource(NOWApplicationReviewResource,
                 '/<string:application_guid>/reviews/<int:now_application_review_id>')
api.add_resource(NOWApplicationDocumentUploadResource, '/<string:application_guid>/document')
api.add_resource(NOWApplicationDocumentSortResource, '/<string:application_guid>/sort-documents')
api.add_resource(NOWApplicationDocumentResource,
                 '/<string:application_guid>/document/<string:mine_document_guid>')
api.add_resource(NOWApplicationDocumentIdentityResource,
                 '/<string:application_guid>/document-identity')
api.add_resource(NOWApplicationDocumentGenerateResource,
                 '/application-document-types/<string:document_type_code>/generate')
api.add_resource(NOWApplicationDelayListResource, '/<string:now_application_guid>/delays')
api.add_resource(AdministrativeAmendmentListResource, '/administrative-amendments')
api.add_resource(NOWApplicationDelayResource,
                 '/<string:now_application_guid>/delays/<string:now_application_delay_guid>')

# now static content
api.add_resource(NOWActivityTypeResource, '/activity-types')
api.add_resource(NOWApplicationTypeResource, '/application-types')
api.add_resource(NOWApplicationDelayTypeResource, '/delay-reasons')
api.add_resource(NOWApplicationStatusCodeResource, '/application-status-codes')
api.add_resource(UnitTypeResource, '/unit-types')
api.add_resource(NOWApplicationDocumentTypeListResource, '/application-document-types')
api.add_resource(NOWApplicationDocumentTypeResource,
                 '/application-document-types/<string:document_type_code>')
api.add_resource(UndergroundExplorationTypeResource, '/underground-exploration-types')
api.add_resource(NOWApplicationProgressStatusResource, '/application-progress-status-codes')
api.add_resource(NOWApplicationPermitTypeResource, '/application-permit-types')
api.add_resource(NOWApplicationReviewTypeResource, '/review-types')
api.add_resource(NOWApplicationExportResource, '/application-export/<string:document_type_code>')