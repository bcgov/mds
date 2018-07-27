from datetime import datetime
from db import db
from sqlalchemy.dialects.postgresql import UUID

class AuditMixin(object):
    create_user = db.Column(db.String(60), nullable=False)
    create_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_user = db.Column(db.String(60), nullable=False)
    update_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class MineIdentifier(AuditMixin, db.Model):
    __tablename__ = 'mine_identifier'
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_details = db.relationship('MineDetails', backref='mine_identifier', lazy=True)
    # might have to add UUID(as_uuid=True) if we want to pass as UUID obj and not string

    def __repr__(self):
        return '<MineIdentifier %r>' % self.mine_guid
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def json(self):
        return {'guid': str(self.mine_guid), 'mine_details': [item.json() for item in self.mine_details]}

class MineDetails(AuditMixin, db.Model):
    __tablename__ = "mine_details"
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identifier.mine_guid'), primary_key=True)
    mine_no = db.Column(db.String(10), primary_key=True, unique=True)
    mine_name = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return '<MineDetails %r>' % self.mine_guid
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    def json(self):
        return {'mine_name': self.mine_name, 'mine_no': self.mine_no}

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.filter_by(mine_no=_id).first()