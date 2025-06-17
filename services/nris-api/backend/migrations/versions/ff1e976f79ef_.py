"""empty message

Revision ID: ff1e976f79ef
Revises: 2e894e86b11c
Create Date: 2025-06-12 13:22:21.231126

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ff1e976f79ef'
down_revision = '2e894e86b11c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('order_stop_detail', sa.Column('order_number', sa.String(), nullable=True))


def downgrade():
    op.drop_column('order_stop_detail', 'order_number')
