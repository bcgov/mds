from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineReportCategoryXref(Base):
    __tablename__ = "mine_report_category_xref"
    mine_report_category_xref_guid = db.Column(UUID(as_uuid=True),
                                               primary_key=True,
                                               server_default=FetchedValue())
    mine_report_definition_id = db.Column(
        db.Integer, db.ForeignKey('mine_report_definition.mine_report_definition_id'))
    mine_report_category = db.Column(db.String(3),
                                     db.ForeignKey('mine_report_category.mine_report_category'))

    def __repr__(self):
        return '<mine_report_category_xref %r>' % self.mine_report_category_xref_guid
