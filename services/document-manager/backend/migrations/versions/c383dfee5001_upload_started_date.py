"""upload_started_date

Revision ID: c383dfee5001
Revises: 17d4ce4dea98
Create Date: 2023-06-24 00:32:22.219037

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c383dfee5001'
down_revision = '17d4ce4dea98'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('document_version', sa.Column('upload_started_date', sa.DateTime(), nullable=True))


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('document_version', 'upload_started_date')
