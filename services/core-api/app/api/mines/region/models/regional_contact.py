from app.extensions import db
from app.api.utils.models_mixins import Base


class RegionalContact(Base):
    __tablename__ = 'regional_contact'

    regional_contact_type_code = db.Column(
        db.String(3),
        db.ForeignKey('regional_contact_type.regional_contact_type_code'),
        primary_key=True)
    mine_region_code = db.Column(
        db.String(2), db.ForeignKey('mine_region_code.mine_region_code'), primary_key=True)
    email = db.Column(db.String(254))
    phone_number = db.Column(db.String(12))
    fax_number = db.Column(db.String(12))
    mailing_address_line_1 = db.Column(db.String(254))
    mailing_address_line_2 = db.Column(db.String(254))

    @classmethod
    def find_regional_contact(cls, regional_contact_type_code, mine_region_code):
        return cls.query.filter_by(
            regional_contact_type_code=regional_contact_type_code,
            mine_region_code=mine_region_code).first()

    def __repr__(self):
        return '<RegionalContact (%r,%r)>' % (self.regional_contact_type_code,
                                              self.mine_region_code)
