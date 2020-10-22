"""create now document job tables

Revision ID: 4a4950ed26bd
Revises: 561823a58bc6
Create Date: 2020-10-21 14:31:24.780205

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '4a4950ed26bd'
down_revision = '561823a58bc6'
branch_labels = None
depends_on = None


def upgrade():

    submission_status_codes = op.create_table(
        'import_now_submission_documents_job_status',
        sa.Column('import_now_submission_documents_job_status_code', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('import_now_submission_documents_job_status_code'))

    op.create_table(
        'import_now_submission_documents_job',
        sa.Column('import_now_submission_documents_job_id', sa.Integer(), nullable=False),
        sa.Column('start_timestamp', sa.DateTime(), nullable=True),
        sa.Column('end_timestamp', sa.DateTime(), nullable=True),
        sa.Column(
            'import_now_submission_documents_job_status_code',
            sa.String(),
            sa.ForeignKey(
                'import_now_submission_documents_job_status.import_now_submission_documents_job_status_code'
            ),
            nullable=False), sa.Column('create_user', sa.String(), nullable=False),
        sa.Column('now_application_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('import_now_submission_documents_job_id'))

    op.create_table(
        'import_now_submission_document',
        sa.Column('import_now_submission_document_id', sa.Integer(), nullable=False),
        sa.Column(
            'document_id', sa.Integer(), sa.ForeignKey('document.document_id'), nullable=True),
        sa.Column(
            'import_now_submission_documents_job_id',
            sa.Integer(),
            sa.ForeignKey(
                'import_now_submission_documents_job.import_now_submission_documents_job_id'),
            nullable=False), sa.Column('submission_document_id', sa.Integer, nullable=False),
        sa.Column('submission_document_url', sa.String(), nullable=False),
        sa.Column('submission_document_file_name', sa.String(), nullable=False),
        sa.Column('error', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('import_now_submission_document_id'))

    op.bulk_insert(submission_status_codes, [
        {
            'import_now_submission_documents_job_status_code': 'INP',
            'description': 'In Progress',
        },
        {
            'import_now_submission_documents_job_status_code': 'SUC',
            'description': 'Success',
        },
        {
            'import_now_submission_documents_job_status_code': 'FAL',
            'description': 'Failure',
        },
    ])


def downgrade():
    op.drop_table('import_now_submission_document')
    op.drop_table('import_now_submission_documents_job')
    op.drop_table('import_now_submission_documents_job_status')