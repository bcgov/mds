from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db

class MineAlert(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "mine_alert"
    mine_alert_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_alert_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    mine_guid = db.Column(db.Integer, db.ForeignKey('mine.mine_guid'), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    contact_name = db.Column(db.String(200), nullable=False)
    contact_phone = db.Column(db.String(12), nullable=False)
    message = db.Column(db.String, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    end_date = db.Column(db.DateTime)

    def __repr__(self):
        return '<MineAlert %r>' % self.mine_alert_guid

    @classmethod
    def create(cls, mine, start_date, end_date, contact_name, contact_phone, message, add_to_session=True):
        new_alert = cls(start_date=start_date, end_date=end_date, contact_name=contact_name, contact_phone=contact_phone, message=message)
        mine.alerts.append(new_alert)

        if add_to_session:
            new_alert.save(commit=False)
        return new_alert

    def update(self, start_date, end_date, contact_name, contact_phone, message, is_active=True, add_to_session=True):
        self.start_date = start_date
        self.end_date = end_date
        self.contact_name = contact_name
        self.contact_phone = contact_phone
        self.message = message
        self.is_active = is_active

        if add_to_session:
            self.save(commit=False)
        return self

    @classmethod
    def find_by_guid(cls, _id):
        return cls.query.filter_by(mine_alert_guid=_id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_active_alert_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).filter_by(is_active=True).order_by(cls.mine_alert_id.desc()).first()

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(mine_alert_id=_id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).filter_by(deleted_ind=False).all()
    
    @classmethod
    def find_all_mine_alerts(cls, page, per_page):
        query = cls.query.filter_by(deleted_ind=False).order_by(cls.create_timestamp.desc())

        if (page):
            result = query.paginate(page, per_page, error_out=False)
            return dict([('total', result.total), ('records', result.items)])

        result = query.all()
        return dict([('total', len(result)), ('records', result)])
