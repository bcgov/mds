from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from .mixins import AuditMixin
from app.extensions import db


class MineIdentity(AuditMixin, db.Model):
    __tablename__ = 'mine_identity'
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_detail = db.relationship('MineDetail', backref='mine_identity', order_by='desc(MineDetail.update_timestamp)', lazy=True)
    mgr_appointment = db.relationship('MgrAppointment', backref='mine_identity', order_by='desc(MgrAppointment.update_timestamp)', lazy=True)
    mineral_tenure_xref = db.relationship('MineralTenureXref', backref='mine_identity', lazy=True)

    # might have to add UUID(as_uuid=True) if we want to pass as UUID obj and not string

    def __repr__(self):
        return '<MineIdentity %r>' % self.mine_guid
    
    def save(self):
        db.session.add(self)
        try:
            db.session.commit()
        except:
            db.session.rollback()

    def json(self):
        return {'guid': str(self.mine_guid), 'mgr_appointment': [item.json() for item in self.mgr_appointment], 'mineral_tenure_xref': [item.json() for item in self.mineral_tenure_xref], 'mine_detail': [item.json() for item in self.mine_detail]}

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            return cls.query.filter_by(mine_guid=_id).first()
        except:
            return None

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.join(cls.mine_detail, aliased=True).filter_by(mine_no=_id).first()


class MineDetail(AuditMixin, db.Model):
    __tablename__ = "mine_detail"
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'), primary_key=True)
    mine_no = db.Column(db.String(10), primary_key=True, unique=True)
    mine_name = db.Column(db.String(60), nullable=False)

    def __repr__(self):
        return '<MineDetail %r>' % self.mine_guid
    
    def save(self):
        db.session.add(self)
        try:
            db.session.commit()
            return True
        except:
            db.session.rollback()
            return False

    def json(self):
        return {'mine_name': self.mine_name, 'mine_no': self.mine_no}

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.filter_by(mine_no=_id).first()


class MineralTenureXref(AuditMixin, db.Model):
    __tablename__ = "mineral_tenure_xref"
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    tenure_number_id = db.Column(db.Numeric(10), primary_key=True, unique=True)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<MineralTenureXref %r>' % self.tenure_number_id

    def save(self):
        db.session.add(self)
        try:
            db.session.commit()
        except:
            db.session.rollback()

    def json(self):
        return {'tenure_number_id': str(self.tenure_number_id)}

    @classmethod
    def find_by_tenure(cls, _id):
        return cls.query.filter_by(tenure_number_id=_id).first()