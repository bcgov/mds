"""add_multipart_upload_columns

Revision ID: 38d624139233
Revises: 9be7dbc60ff8
Create Date: 2023-12-19 20:10:55.180085

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '38d624139233'
down_revision = '9be7dbc60ff8'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("document") as batch_op:
        batch_op.add_column(sa.Column('multipart_upload_id', sa.String(length=1024), server_default=None, nullable=True))
        batch_op.add_column(sa.Column('multipart_upload_path', sa.String(length=4096), server_default=None, nullable=True))


def downgrade():
    with op.batch_alter_table("document") as batch_op:
        batch_op.drop_column('multipart_upload_id')
        batch_op.drop_column('multipart_upload_path')
