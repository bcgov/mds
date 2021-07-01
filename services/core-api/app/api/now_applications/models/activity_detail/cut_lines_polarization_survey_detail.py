from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class CutLinesPolarizationSurveyDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'cut_lines_polarization_survey'}

    def __repr__(self):
        return '<CutLinesPolarizationSurveyDetail %r>' % self.activity_detail_id

    def __init__(self, **kwargs):
        self.cut_line_length_unit_type_code = 'KMT'
        super(CutLinesPolarizationSurveyDetail, self).__init__(**kwargs)
