"""Add object_store_path column to document

Revision ID: 9edbc0020b22
Revises: 7eefdf5d93c4
Create Date: 2020-06-15 08:54:27.388345

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9edbc0020b22'
down_revision = '7eefdf5d93c4'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('document', sa.Column('create_user', sa.String(length=60), nullable=False),
                    sa.Column('create_timestamp', sa.DateTime(), nullable=False),
                    sa.Column('update_user', sa.String(length=60), nullable=False),
                    sa.Column('update_timestamp', sa.DateTime(), nullable=False),
                    sa.Column('document_id', sa.Integer(), nullable=False),
                    sa.Column('document_guid', postgresql.UUID(as_uuid=True), nullable=False),
                    sa.Column('full_storage_path', sa.String(length=4096), nullable=False),
                    sa.Column('upload_started_date', sa.DateTime(), nullable=False),
                    sa.Column('upload_completed_date', sa.DateTime(), nullable=True),
                    sa.Column('file_display_name', sa.String(length=255), nullable=False),
                    sa.Column('path_display_name', sa.String(length=4096), nullable=False),
                    sa.Column('object_store_path', sa.String(), nullable=True),
                    sa.PrimaryKeyConstraint('document_id'))


def downgrade():
    op.drop_table('document')
