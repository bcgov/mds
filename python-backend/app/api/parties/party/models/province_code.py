from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class ProvinceCode(AuditMixin, Base):
    __tablename__ = 'province_code'
    province_code = db.Column(db.String(2), nullable=False, primary_key=True)
    description = db.Column(db.String(50), nullable=False)
    display_order = db.Column(db.Integer, nullable=True)
    active_ind = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return '<ProvinceCode %r>' % self.province_code

    def json(self):
        return {
            'province_code': self.province_code,
            'description': self.description,
            'display_order': str(self.display_order)
        }
