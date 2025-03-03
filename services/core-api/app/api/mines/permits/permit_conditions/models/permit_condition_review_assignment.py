from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.api.users.models.user import User

class PermitConditionReviewAssignment(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'permit_condition_review_assignment'
    __versioned__ = {}

    condition_review_assignment_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    permit_amendment_id = db.Column(db.Integer, db.ForeignKey('permit_amendment.permit_amendment_id'), nullable=False)
    condition_category_code = db.Column(db.String, db.ForeignKey('permit_condition_category.condition_category_code'), nullable=False)
    user_sub = db.Column(db.String, db.ForeignKey(User.sub), nullable=True)

    assigned_review_user = db.relationship(
        User,
        backref='permit_condition_review_assignments',
        lazy='joined',
        uselist=False,
        foreign_keys=[user_sub]
    )

    def __repr__(self):
        return f'<ConditionReviewAssignment {self.condition_review_assignment_guid} amendment: {self.permit_amendment_id}, category: {self.condition_category_code}, user: {self.user_sub}>'

    @staticmethod
    def get_by_permit_amendment_id(permit_amendment_id):
        review_assignments = PermitConditionReviewAssignment.query.filter_by(permit_amendment_id=permit_amendment_id, deleted_ind=False).all()
        return review_assignments

    @staticmethod
    def get_by_assignment_guid(condition_review_assignment_guid):
        assignment = PermitConditionReviewAssignment.query.filter_by(condition_review_assignment_guid=condition_review_assignment_guid).one_or_none()
        return assignment
    
    @classmethod
    def create_or_update(cls, permit_amendment_id, condition_category_code, user_sub):
        review_assignment = cls.query.filter_by(permit_amendment_id=permit_amendment_id, condition_category_code=condition_category_code, deleted_ind=False).first()

        if review_assignment is None:
            review_assignment = cls(permit_amendment_id=permit_amendment_id, condition_category_code=condition_category_code, user_sub=user_sub)

        elif review_assignment.user_sub != user_sub:
            review_assignment.user_sub = user_sub

        review_assignment.save()
        return review_assignment
    
    def unassign_review_user(self):
        self.delete()
    
