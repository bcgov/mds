import uuid
from datetime import datetime

from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.extensions import db
from flask.globals import current_app
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates, relationship
from sqlalchemy.schema import FetchedValue


class PermitConditionCategory(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'permit_condition_category'
    __versioned__ = {}

    # This is auto-generated for Mines Act Permit Conditions that are unique to a permit amendment.
    # for other permit types, thes are standard codes (e.g. GEC for General, HSC for Health and Safety etc.)
    condition_category_code = db.Column(db.String, nullable=False, primary_key=True)
    step = db.Column(db.String) # E.g. A, B, C etc.
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)

    user_sub = db.Column(db.String, db.ForeignKey('user.sub', ondelete='SET NULL', onupdate="CASCADE"))

    assigned_review_user = db.relationship(
        'User',
        back_populates='permit_condition_categories',
        lazy='selectin'
    )

    # For Mines Act Permits, condition categories can be unique to a mine.
    # This is not the case for other permit types where the condition categories are standard (e.g. General Health and Safety etc.)
    # Reasoning: The condition categories have changed over the years, and we need to be able to reflect the correct category
    # for the permit at the time the permit was issued even if the category has since been updated.
    permit_amendment_id = db.Column(db.Integer, db.ForeignKey('permit_amendment.permit_amendment_id'), nullable=True)

    def __repr__(self):
        return '<PermitConditionCategory %r>' % self.condition_category_code

    @classmethod
    def create(cls,
            condition_category_code,
            step,
            description,
            display_order,
            permit_amendment_id,
    ):
        permit_condition_category = PermitConditionCategory(
            condition_category_code=str(condition_category_code),
            step=step,
            description=description,
            display_order=display_order,
            permit_amendment_id=permit_amendment_id
        )
        permit_condition_category.save()
        return permit_condition_category

    @classmethod
    def get_all(cls):
        return cls.query \
            .filter_by(permit_amendment_id=None, deleted_ind=False) \
            .order_by(cls.display_order) \
            .all()

    @classmethod
    def search(cls, query=None, exclude=None, limit=None):
        quer = cls.query \
            .filter_by(deleted_ind=False)
        
        if query:
            quer = quer.filter(db.func.lower(cls.description).ilike(f'%{query.lower()}%'))
        else:
            # Return general categories if you're not searching for anything specific
            quer = quer.filter_by(permit_amendment_id=None)

        if exclude:
            quer = quer.filter(~db.func.lower(cls.condition_category_code).in_([e.lower() for e in exclude]))

        # Make sure we only return distinct descriptions
        # and order by display order
        quer = quer.distinct(cls.description) \
            .from_self() \
            .order_by(cls.display_order)

        if limit:
            quer = quer.limit(limit)
        elif query:
            quer = quer.limit(7)

        return  quer.all()

    @classmethod
    def find_by_permit_condition_category_code(cls, code):
        return cls.query.filter_by(condition_category_code=code, active_ind=True, deleted_ind=False).one_or_none()
    
    @classmethod
    def find_by_permit_amendment_id_and_description(cls, permit_amendment_id, description):
        return cls.query.filter_by(permit_amendment_id=permit_amendment_id, description=description, deleted_ind=False).one_or_none()
    
    @classmethod
    def find_by_permit_amendment_id(cls, permit_amendment_id):
        return cls.query \
                .filter_by(permit_amendment_id=permit_amendment_id, deleted_ind=False) \
                .order_by(cls.display_order) \
                .all()
    @classmethod
    def delete_all_by_permit_amendment_id(cls, permit_amendment_id):
        to_delete = cls.query \
            .filter_by(
                permit_amendment_id=permit_amendment_id,
                deleted_ind=False
            ).all()

        for cat in to_delete:
            cat.delete(commit=False)

        db.session.commit()
