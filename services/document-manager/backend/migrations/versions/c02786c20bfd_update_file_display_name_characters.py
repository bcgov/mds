"""update-file-display-name-characters

Revision ID: c02786c20bfd
Revises: c383dfee5001
Create Date: 2023-09-06 18:44:39.595932

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c02786c20bfd'
down_revision = 'c383dfee5001'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("document_version") as batch_op:
        batch_op.alter_column('file_display_name',
                              type_=sa.String(length=255),
                              existing_type=sa.String(length=40),
                              existing_nullable=False)

def downgrade():
    with op.batch_alter_table("document_version") as batch_op:
        batch_op.alter_column('file_display_name',
                              type_=sa.String(length=40),
                              existing_type=sa.String(length=255),
                              existing_nullable=False)