"""empty message

Revision ID: 136b2d0f435d
Revises: 
Create Date: 2019-07-12 17:27:55.602673

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import FetchedValue

# revision identifiers, used by Alembic.
revision = '136b2d0f435d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'document_manager', sa.Column('create_user', sa.String(length=60), nullable=False),
        sa.Column('create_timestamp', sa.DateTime(), nullable=False),
        sa.Column('update_user', sa.String(length=60), nullable=False),
        sa.Column('update_timestamp', sa.DateTime(), nullable=False),
        sa.Column('document_manager_id',
                  sa.Integer(),
                  server_default=FetchedValue(),
                  nullable=False),
        sa.Column('document_guid', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('full_storage_path', sa.String(length=150), nullable=False),
        sa.Column('upload_started_date', sa.DateTime(), nullable=False),
        sa.Column('upload_completed_date', sa.DateTime(), nullable=True),
        sa.Column('file_display_name', sa.String(length=40), nullable=False),
        sa.Column('path_display_name', sa.String(length=150), nullable=False),
        sa.PrimaryKeyConstraint('document_manager_id'))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('document_manager')
    # ### end Alembic commands ###
