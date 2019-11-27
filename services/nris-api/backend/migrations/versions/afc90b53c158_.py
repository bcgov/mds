"""empty message

Revision ID: afc90b53c158
Revises: a96d450a8cc3
Create Date: 2019-10-11 20:07:56.743427

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'afc90b53c158'
down_revision = 'a96d450a8cc3'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('inspection_reason',
                    sa.Column('inspection_reason_id',
                              sa.Integer(), nullable=False),
                    sa.Column('inspection_reason_code',
                              sa.String(length=32), nullable=False),
                    sa.Column('inspection_reason_description',
                              sa.String(length=256), nullable=True),
                    sa.PrimaryKeyConstraint('inspection_reason_id'),
                    comment='Lookup table that contains a list of inspection reasons. E.g. Planned, Unplanned, Compliant, Non-compliance report'
                    )
    op.create_table('inspection_substatus',
                    sa.Column('inspection_substatus_id',
                              sa.Integer(), nullable=False),
                    sa.Column('inspection_substatus_code',
                              sa.String(length=32), nullable=False),
                    sa.Column('inspection_substatus_description',
                              sa.String(length=256), nullable=True),
                    sa.PrimaryKeyConstraint('inspection_substatus_id'),
                    comment='Lookup table that contains a list of inspection substatuses. E.g. Open, Closed, Report Sent, Response Recieved, '
                    )
    op.add_column('inspection', sa.Column(
        'inspection_auth_source_application', sa.String(), nullable=True))
    op.add_column('inspection', sa.Column(
        'inspection_auth_source_id', sa.String(), nullable=True))
    op.add_column('inspection', sa.Column(
        'inspection_auth_status', sa.String(), nullable=True))
    op.add_column('inspection', sa.Column(
        'inspection_auth_type', sa.String(), nullable=True))
    op.add_column('inspection', sa.Column(
        'inspection_reason_id', sa.Integer(), nullable=True))
    op.add_column('inspection', sa.Column(
        'inspection_substatus_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'inspection', 'inspection_reason', [
                          'inspection_reason_id'], ['inspection_reason_id'])
    op.create_foreign_key(None, 'inspection', 'inspection_substatus', [
                          'inspection_substatus_id'], ['inspection_substatus_id'])


def downgrade():
    op.drop_constraint(None, 'inspection', type_='foreignkey')
    op.drop_constraint(None, 'inspection', type_='foreignkey')
    op.drop_column('inspection', 'inspection_substatus_id')
    op.drop_column('inspection', 'inspection_reason_id')
    op.drop_column('inspection', 'inspection_auth_type')
    op.drop_column('inspection', 'inspection_auth_status')
    op.drop_column('inspection', 'inspection_auth_source_id')
    op.drop_column('inspection', 'inspection_auth_source_application')
    op.drop_table('inspection_substatus')
    op.drop_table('inspection_reason')
