"""empty message

Revision ID: 561823a58bc6
Revises: 7eefdf5d93c4
Create Date: 2020-06-15 17:32:18.460047

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '561823a58bc6'
down_revision = '7eefdf5d93c4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('document', sa.Column('object_store_path', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('document', 'object_store_path')
    # ### end Alembic commands ###
