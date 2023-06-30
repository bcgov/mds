"""add document versioning

Revision ID: 17d4ce4dea98
Revises: 4a4950ed26bd
Create Date: 2023-06-16 12:15:22.391281

"""
import datetime
import uuid
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '17d4ce4dea98'
down_revision = '4a4950ed26bd'
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint(
        'document_guid_unique', 'document', ['document_guid'])
    op.create_table(
        'document_version',
        sa.Column('id', postgresql.UUID(as_uuid=True),
                  primary_key=True, default=uuid.uuid4),
        sa.Column('document_guid', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('document.document_guid'), nullable=False),
        sa.Column('created_by', sa.String(length=60), nullable=False),
        sa.Column('created_date', sa.DateTime(), nullable=False),
        sa.Column('upload_completed_date', sa.DateTime(),
                  nullable=True, default=datetime.datetime.utcnow),
        sa.Column('object_store_version_id', sa.String(), nullable=True),
        sa.Column('file_display_name', sa.String(length=40), nullable=False),
    )

    op.add_column('document', sa.Column(
        'created_by', sa.String(length=60), nullable=True))


def downgrade():
    op.drop_table('document_version')
    op.drop_column('document', 'created_by')
