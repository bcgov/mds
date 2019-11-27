from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class CutLinesPolarizationSurvey(ActivitySummaryBase):
    __mapper_args__ = {
        'polymorphic_identity': 'cut_lines_polarization_survey', ## type code
    }

    ## NO TABLE FOR THIS TYPE
    details = db.relationship(
        'CutLinesPolarizationSurveyDetail',
        secondary='activity_summary_detail_xref',
        load_on_pending=True)

    def __repr__(self):
        return '<CutLinesPolarizationSurvey %r>' % self.activity_summary_id
