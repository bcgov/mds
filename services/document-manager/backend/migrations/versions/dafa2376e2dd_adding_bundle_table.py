"""adding bundle table

Revision ID: dafa2376e2dd
Revises: 38d624139233
Create Date: 2024-06-17 18:10:24.757394

"""
from sqlalchemy.dialects.postgresql import UUID

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dafa2376e2dd'
down_revision = '38d624139233'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'document_bundle',
        sa.Column('bundle_guid', UUID(as_uuid=True), primary_key=True),
        sa.Column('create_timestamp', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('create_user', sa.String(length=60), nullable=False),
        sa.Column('update_user', sa.String(length=60), nullable=False),
        sa.Column('update_timestamp', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('deleted_ind', sa.Boolean(), server_default='FALSE', nullable=False),
        sa.Column('name', sa.String(length=300), nullable=False),
        sa.Column('geomark_link', sa.String(length=300), nullable=True),
        sa.Column('error', sa.String(length=1000), nullable=True),
    )
    op.add_column('document', sa.Column('document_bundle_guid', UUID(as_uuid=True), sa.ForeignKey('document_bundle.bundle_guid'), nullable=True,))


def downgrade():
    op.drop_table('mine_document_bundle')
    op.drop_column('document', 'docman_bundle_guid')
