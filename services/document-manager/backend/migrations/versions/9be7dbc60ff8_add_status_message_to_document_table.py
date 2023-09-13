"""add_status_message_to_document_table

Revision ID: 9be7dbc60ff8
Revises: c02786c20bfd
Create Date: 2023-09-08 21:32:57.125152

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = '9be7dbc60ff8'
down_revision = 'c02786c20bfd'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("document") as batch_op:
        batch_op.add_column(sa.Column('status', sa.String(length=255), server_default=text("'In Progress'"), nullable=True))


def downgrade():
    with op.batch_alter_table("document") as batch_op:
        batch_op.drop_column('status')
