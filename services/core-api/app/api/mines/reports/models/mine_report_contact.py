from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db

class MineReportContact(SoftDeleteMixin, Base):
    __tablename__ = "mine_report_contact"
    mine_report_contact_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_id = db.Column(db.Integer, db.ForeignKey('mine_report.mine_report_id'), nullable=False)
    mine_report_submission_id = db.Column(db.Integer, db.ForeignKey('mine_report_submission.mine_report_submission_id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return '<MineReportContact %r>' % self.name

    @classmethod
    def create(cls, name, email, add_to_session=True):
        new_contact = cls(name=name, email=email)
        if add_to_session:
            new_contact.save(commit=False)
        return new_contact

    @classmethod
    def create_from_list(cls, contact_list, mine_report_id, mine_report_submission_id, add_to_session=True):
        contacts = []
        for contact in contact_list:
            contacts.append(cls.create(name=contact['name'], email=contact['email'], add_to_session=add_to_session))
        return contacts

    def json(self):
        return {
            'mine_report_contact_id': self.mine_report_contact_id,
            'mine_report_id': self.mine_report_id,
            'mine_report_submission_id': self.mine_report_submission_id,
            'name': str(self.name),
            'email': str(self.email)
        }