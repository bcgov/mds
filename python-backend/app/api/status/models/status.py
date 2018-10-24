from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ...utils.models_mixins import AuditMixin, Base


class MineStatus(AuditMixin, Base):
    __tablename__ = 'mine_status'
    mine_status_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    mine_status_xref_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_status_xref.mine_status_xref_guid'))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineStatus %r>' % self.mine_status

    def validate_status_code_exists(self, mine_status_xref, mine_status_code, code_or_description):
        try:
            return mine_status_xref[mine_status_code][code_or_description]
        except KeyError:
            return None

    def create_mine_status_values_list(self, mine_status_xref):
        status_values_list = []
        _mine_operation_status_code = self.validate_status_code_exists(mine_status_xref, 'mine_operation_status_code', 'mine_operation_status_code')
        _mine_operation_status_reason_code = self.validate_status_code_exists(mine_status_xref, 'mine_operation_status_reason_code', 'mine_operation_status_reason_code')
        _mine_operation_status_sub_reason_code = self.validate_status_code_exists(mine_status_xref, 'mine_operation_status_sub_reason_code', 'mine_operation_status_sub_reason_code')
        if _mine_operation_status_code:
            status_values_list.append(_mine_operation_status_code)
        if _mine_operation_status_reason_code:
            status_values_list.append(_mine_operation_status_reason_code)
        if _mine_operation_status_sub_reason_code:
            status_values_list.append(_mine_operation_status_sub_reason_code)
        return status_values_list

    def create_mine_status_labels_list(self, mine_status_xref):
        status_labels_list = []
        _mine_operation_status_code = self.validate_status_code_exists(mine_status_xref, 'mine_operation_status_code', 'description')
        _mine_operation_status_reason_code = self.validate_status_code_exists(mine_status_xref, 'mine_operation_status_reason_code', 'description')
        _mine_operation_status_sub_reason_code = self.validate_status_code_exists(mine_status_xref, 'mine_operation_status_sub_reason_code', 'description')
        if _mine_operation_status_code:
            status_labels_list.append(_mine_operation_status_code)
        if _mine_operation_status_reason_code:
            status_labels_list.append(_mine_operation_status_reason_code)
        if _mine_operation_status_sub_reason_code:
            status_labels_list.append(_mine_operation_status_sub_reason_code)
        return status_labels_list

    def json(self, show_mgr=True):
        mine_status_xref_json = MineStatusXref.find_by_mine_status_xref_guid(self.mine_status_xref_guid).json()
        status_values_list = self.create_mine_status_values_list(mine_status_xref_json)
        status_labels_list = self.create_mine_status_labels_list(mine_status_xref_json)
        return {
            'mine_status_guid': str(self.mine_status_guid),
            'mine_guid': str(self.mine_guid),
            'mine_status_xref_guid': str(self.mine_status_xref_guid),
            'status_values': status_values_list,
            'status_labels': status_labels_list,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_status_guid(cls, _id):
        return cls.query.filter_by(mine_status_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).first()

    @classmethod
    def find_by_mine_status_xref_guid(cls, _id):
        return cls.query.filter_by(mine_status_xref_guid=_id).first()


class MineStatusXref(AuditMixin, Base):
    __tablename__ = 'mine_status_xref'
    mine_status_xref_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_operation_status_code = db.Column(db.String(3), db.ForeignKey('mine_operation_status_code.mine_operation_status_code'))
    mine_operation_status_reason_code = db.Column(db.String(3), db.ForeignKey('mine_operation_status_reason_code.mine_operation_status_reason_code'))
    mine_operation_status_sub_reason_code = db.Column(db.String(3), db.ForeignKey('mine_operation_status_sub_reason_code.mine_operation_status_sub_reason_code'))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineStatusXref %r>' % self.mine_status_xref_guid

    def json(self):
        mine_operation_status_code = MineOperationStatusCode.find_by_mine_operation_status_code(self.mine_operation_status_code)
        mine_operation_status_reason_code = MineOperationStatusReasonCode.find_by_mine_operation_status_reason_code(self.mine_operation_status_reason_code)
        mine_operation_status_sub_reason_code = MineOperationStatusSubReasonCode.find_by_mine_operation_status_sub_reason_code(self.mine_operation_status_sub_reason_code)
        return {
            'mine_status_xref_guid': str(self.mine_status_xref_guid),
            'mine_operation_status_code': mine_operation_status_code.json() if mine_operation_status_code else {},
            'mine_operation_status_reason_code': mine_operation_status_reason_code.json() if mine_operation_status_reason_code else {},
            'mine_operation_status_sub_reason_code': mine_operation_status_sub_reason_code.json() if mine_operation_status_sub_reason_code else {},
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_status_xref_guid(cls, _id):
        return cls.query.filter_by(mine_status_xref_guid=_id).first()


class MineOperationStatusCode(AuditMixin, Base):
    __tablename__ = 'mine_operation_status_code'
    mine_operation_status_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineOperationStatusCode %r>' % self.mine_operation_status_code

    def json(self):
        return {
            'mine_operation_status_code': self.mine_operation_status_code,
            'description': self.description,
            'display_order': str(self.display_order),
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_operation_status_code(cls, _id):
        return cls.query.filter_by(mine_operation_status_code=_id).first()

    @classmethod
    def create_mine_operation_status_code(cls, code, description, display_order, user_kwargs, save=True):
        mine_operation_status_code = cls(
            mine_operation_status_code=code,
            description=description,
            display_order=display_order,
            **user_kwargs
        )
        if save:
            mine_operation_status_code.save(commit=False)
        return mine_operation_status_code

    @validates('mine_operation_status_code')
    def validate_mine_operation_status_code(self, key, mine_operation_status_code):
        if not mine_operation_status_code:
            raise AssertionError('Mine operation status code is not provided.')
        if len(mine_operation_status_code) > 3:
            raise AssertionError('Mine operation status code must not exceed 3 characters.')
        return mine_operation_status_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Mine operation status code description is not provided.')
        if len(description) > 100:
            raise AssertionError('Mine operation status code description must not exceed 100 characters.')
        return description


class MineOperationStatusReasonCode(AuditMixin, Base):
    __tablename__ = 'mine_operation_status_reason_code'
    mine_operation_status_reason_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineOperationStatusReasonCode %r>' % self.mine_operation_status_reason_code

    def json(self):
        return {
            'mine_operation_status_reason_code': self.mine_operation_status_reason_code,
            'description': self.description,
            'display_order': str(self.display_order),
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_operation_status_reason_code(cls, _id):
        return cls.query.filter_by(mine_operation_status_reason_code=_id).first()

    @classmethod
    def create_mine_operation_status_reason_code(cls, code, description, display_order, user_kwargs, save=True):
        mine_operation_status_reason_code = cls(
            mine_operation_status_reason_code=code,
            description=description,
            display_order=display_order,
            **user_kwargs
        )
        if save:
            mine_operation_status_reason_code.save(commit=False)
        return mine_operation_status_reason_code

    @validates('mine_operation_status_reason_code')
    def validate_mine_operation_status_reason_code(self, key, mine_operation_status_reason_code):
        if not mine_operation_status_reason_code:
            raise AssertionError('Mine operation status reason code is not provided.')
        if len(mine_operation_status_reason_code) > 3:
            raise AssertionError('Mine operation status reason code must not exceed 3 characters.')
        return mine_operation_status_reason_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Mine operation status reason code description is not provided.')
        if len(description) > 100:
            raise AssertionError('Mine operation status reason code description must not exceed 100 characters.')
        return description


class MineOperationStatusSubReasonCode(AuditMixin, Base):
    __tablename__ = 'mine_operation_status_sub_reason_code'
    mine_operation_status_sub_reason_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineOperationStatusSubReasonCode %r>' % self.mine_operation_status_sub_reason_code

    def json(self):
        return {
            'mine_operation_status_sub_reason_code': self.mine_operation_status_sub_reason_code,
            'description': self.description,
            'display_order': str(self.display_order),
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_operation_status_sub_reason_code(cls, _id):
        return cls.query.filter_by(mine_operation_status_sub_reason_code=_id).first()

    @classmethod
    def create_mine_operation_status_sub_reason_code(cls, code, description, display_order, user_kwargs, save=True):
        mine_operation_status_sub_reason_code = cls(
            mine_operation_status_sub_reason_code=code,
            description=description,
            display_order=display_order,
            **user_kwargs
        )
        if save:
            mine_operation_status_sub_reason_code.save(commit=False)
        return mine_operation_status_sub_reason_code

    @validates('mine_operation_status_sub_reason_code')
    def validate_mine_operation_status_reason_code(self, key, mine_operation_status_sub_reason_code):
        if not mine_operation_status_sub_reason_code:
            raise AssertionError('Mine operation status sub reason code is not provided.')
        if len(mine_operation_status_sub_reason_code) > 3:
            raise AssertionError('Mine operation status sub reason code must not exceed 3 characters.')
        return mine_operation_status_sub_reason_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Mine operation status sub reason code description is not provided.')
        if len(description) > 100:
            raise AssertionError('Mine operation status sub reason code description must not exceed 100 characters.')
        return description
