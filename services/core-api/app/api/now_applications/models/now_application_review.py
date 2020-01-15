from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from sqlalchemy.ext.associationproxy import association_proxy
from app.extensions import db

from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.include.user_info import User


class NOWApplicationReviewDocumentXref(Base):
    __tablename__ = "now_application_review_document_xref"
    now_application_review_id = db.Column(
        db.Integer,
        db.ForeignKey('now_application_review.now_application_review_id'),
        primary_key=True)
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'), primary_key=True)


class NOWApplicationReview(Base, AuditMixin):
    __tablename__ = "now_application_review"

    now_application_review_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_id = db.Column(
        db.Integer, db.ForeignKey('now_application.now_application_id'), nullable=False)

    now_application_review_type_code = db.Column(
        db.String,
        db.ForeignKey('now_application_review_type.now_application_review_type_code'),
        nullable=False)

    response_date = db.Column(db.DateTime)
    referee_name = db.Column(db.String)

    documents = db.relationship('NOWApplicationDocumentXref', backref='now_application_review')

    def __repr__(self):
        return '<NOWApplicationReview %r>' % self.now_application_review_id

    @classmethod
    def create(cls,
               now_application,
               now_application_review_type_code,
               response_date=None,
               referee_name=None,
               add_to_session=True):
        review = cls(
            now_application_review_type_code=now_application_review_type_code,
            response_date=response_date,
            referee_name=referee_name)
        now_application.reviews.append(review)
        if add_to_session:
            review.save(commit=False)
        return review