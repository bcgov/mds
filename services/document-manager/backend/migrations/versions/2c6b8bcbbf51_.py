"""empty message

Revision ID: 2c6b8bcbbf51
Revises: 7eefdf5d93c4
Create Date: 2020-06-15 17:22:00.014669

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2c6b8bcbbf51'
down_revision = '7eefdf5d93c4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('object_store_path', sa.String(), nullable=True)


def downgrade():
    pass