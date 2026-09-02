from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineDocumentBundlePurposeXref(AuditMixin, Base):
    __tablename__ = 'mine_document_bundle_purpose_xref'

    bundle_id = db.Column(
        db.Integer, db.ForeignKey('mine_document_bundle.bundle_id'), primary_key=True)
    spatial_bundle_purpose_code = db.Column(
        db.String,
        db.ForeignKey('spatial_bundle_purpose_code.spatial_bundle_purpose_code'),
        primary_key=True)


class SpatialBundlePurposeCode(AuditMixin, Base):
    __tablename__ = 'spatial_bundle_purpose_code'

    spatial_bundle_purpose_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<SpatialBundlePurposeCode {self.spatial_bundle_purpose_code}>'

    @classmethod
    def find_by_code(cls, code):
        return cls.query.get(code)

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(active_ind=True).order_by(cls.display_order).all()
