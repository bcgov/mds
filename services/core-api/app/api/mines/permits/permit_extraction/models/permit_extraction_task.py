from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import backref
from sqlalchemy.schema import FetchedValue


class PermitExtractionTask(AuditMixin, Base):
    __tablename__ = 'permit_extraction_task'

    # This is a unique identifier for the task
    permit_extraction_task_id = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=db.FetchedValue())
    
    # This is the task_id for the actual extraction task as returned by the permit service
    task_id = db.Column(db.String(255), nullable=False)
    task_status = db.Column(db.String(255), nullable=False)
    task_meta = db.Column(db.JSON, nullable=True)
    task_result = db.Column(db.JSON, nullable=True)

    # This is the task_id for the core celery task that is responsible for updating the status of the extraction task
    core_status_task_id = db.Column(db.String(255), nullable=True)
    
    permit_amendment_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_guid'), nullable=False)
    permit_amendment_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment_document.permit_amendment_document_guid'), nullable=False)

    permit_amendment = db.relationship('PermitAmendment', lazy='select', backref=backref('permit_extraction_tasks', lazy='select', order_by='PermitExtractionTask.create_timestamp.desc()'))

    permit_amendment_document = db.relationship('PermitAmendmentDocument', lazy='select')

    def to_dict(self):
        return {
            'permit_extraction_task_id': str(self.permit_extraction_task_id),
            'task_id': self.task_id,
            'task_status': self.task_status,
            'task_meta': self.task_meta,
            'task_result': self.task_result,
            'core_status_task_id': self.core_status_task_id,
            'permit_amendment_guid': str(self.permit_amendment_guid),
            'permit_amendment_document_guid': str(self.permit_amendment_document_guid),
            'create_timestamp': self.create_timestamp.isoformat(),
            'update_timestamp': self.update_timestamp.isoformat()
        }

    @staticmethod
    def get_by_task_id(task_id):
        return PermitExtractionTask.query.filter_by(task_id=task_id).order_by(PermitExtractionTask.create_timestamp.desc())

    @staticmethod
    def get_by_permit_extraction_task_id(permit_extraction_task_id):
        return PermitExtractionTask.query.filter_by(permit_extraction_task_id=permit_extraction_task_id).order_by(PermitExtractionTask.create_timestamp.desc())
    
    @staticmethod
    def get_by_permit_amendment_guid(permit_amendment_guid):
        return PermitExtractionTask.query.filter_by(permit_amendment_guid=permit_amendment_guid).order_by(PermitExtractionTask.create_timestamp.desc()).all()

    @classmethod
    def create(cls, **kwargs):
        obj = cls(**kwargs)
        db.session.add(obj)
        db.session.commit()
        return obj

    @classmethod
    def get_dashboard_stats(cls):
        """Get aggregated statistics for all extraction tasks"""
        from datetime import datetime, timedelta

        from sqlalchemy import func

        # Get total counts by status
        status_counts = db.session.query(
            cls.task_status,
            func.count(cls.permit_extraction_task_id)
        ).group_by(cls.task_status).all()

        # Get counts for last 24 hours
        last_24h = datetime.utcnow() - timedelta(days=1)
        recent_counts = db.session.query(
            cls.task_status,
            func.count(cls.permit_extraction_task_id)
        ).filter(cls.create_timestamp >= last_24h).group_by(cls.task_status).all()

        # Get hierarchical data
        mines_data = []
        tasks = cls.query.order_by(cls.create_timestamp.desc()).all()
        processed_mines = set()

        for task in tasks:
            amendment = task.permit_amendment
            permit = amendment.permit
            mine = permit._all_mines[0]  # Using existing relationship

            if mine.mine_guid in processed_mines:
                continue

            mine_data = {
                'mine_guid': str(mine.mine_guid),
                'mine_name': mine.mine_name,
                'mine_no': mine.mine_no,
                'permits': []
            }

            for permit in mine.mine_permit:  # Using existing relationship
                permit_data = {
                    'permit_guid': str(permit.permit_guid),
                    'permit_no': permit.permit_no,
                    'amendments': []
                }

                for amendment in permit.permit_amendments:  # Using existing relationship
                    amendment_tasks = [t for t in tasks if str(t.permit_amendment_guid) == str(amendment.permit_amendment_guid)]
                    
                    if amendment_tasks:
                        amendment_data = {
                            'amendment_guid': str(amendment.permit_amendment_guid),
                            'issue_date': amendment.issue_date.isoformat() if amendment.issue_date else None,
                            'tasks': [{
                                'task_id': str(task.permit_extraction_task_id),
                                'status': task.task_status,
                                'mine_name': mine.mine_name,
                                'mine_no': mine.mine_no,
                                'permit_no': permit.permit_no,
                                'amendment_issue_date': amendment.issue_date.isoformat() if amendment.issue_date else None,
                                'document_name': task.permit_amendment_document.document_name if task.permit_amendment_document else None,
                                'document_guid': str(task.permit_amendment_document_guid),
                                'created': task.create_timestamp.isoformat() if task.create_timestamp else None,
                                'updated': task.update_timestamp.isoformat() if task.update_timestamp else None
                            }   for task in amendment_tasks]
                        }
                        permit_data['amendments'].append(amendment_data)

                if permit_data['amendments']:
                    mine_data['permits'].append(permit_data)

            if mine_data['permits']:
                mines_data.append(mine_data)
                processed_mines.add(mine.mine_guid)

        # Get recent tasks with additional info using relationships
        recent_tasks = [{
            'task_id': str(task.permit_extraction_task_id),
            'status': task.task_status,
            'mine_name': task.permit_amendment.permit._all_mines[0].mine_name,
            'mine_no': task.permit_amendment.permit._all_mines[0].mine_no,
            'permit_no': task.permit_amendment.permit.permit_no,
            'amendment_issue_date': task.permit_amendment.issue_date.isoformat() if task.permit_amendment.issue_date else None,
            'document_name': task.permit_amendment_document.document_name if task.permit_amendment_document else None,
            'created': task.create_timestamp.isoformat() if task.create_timestamp else None,
            'updated': task.update_timestamp.isoformat() if task.update_timestamp else None
        } for task in cls.query.order_by(cls.create_timestamp.desc()).limit(5).all()]

        return {
            'total_counts': dict(status_counts),
            'last_24h': dict(recent_counts),
            'recent_tasks': recent_tasks,
            'mines': mines_data
        }
