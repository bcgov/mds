from flask_restx import Namespace

from app.api.document_generation.resources.explosives_permit_amendment_document_resource import \
    ExplosivesPermitAmendmentDocumentResource
from app.api.document_generation.resources.now_document_resource import NoticeOfWorkDocumentResource
from app.api.document_generation.resources.explosives_permit_document_resource import ExplosivesPermitDocumentResource

api = Namespace('documents', description='Generate documents for business objects.')

api.add_resource(NoticeOfWorkDocumentResource, '/notice-of-work')
api.add_resource(ExplosivesPermitDocumentResource, '/explosives-permit')
api.add_resource(ExplosivesPermitAmendmentDocumentResource, '/explosives-permit-amendment')
