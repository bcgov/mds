"""empty message

Revision ID: 43cd9db1c73a
Revises: ce5572d67c90
Create Date: 2019-09-03 17:44:27.125473

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '43cd9db1c73a'
down_revision = 'ce5572d67c90'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table_comment(
        'document_type', 'Lookup table that contains a list of inspection document types; i.e. Map, Report, Mine Manager Response, Image, Document, Final Report.')
    op.create_table_comment('inspected_location_type', 'Lookup table that provides types of Areas Inspected and Observations relating to an inspection location details; i.e. general, stop. Stop = applied to Areas Inspected General = applied to General Observations Both General and Stop type observations may be applied to one or more orders, warnings, advisories, and requests… or a combination of them all.')
    op.create_table_comment(
        'inspection_status', 'Lookup table that contains a list of inspection statuses. For example; Complete, Incomplete.')
    op.create_table_comment(
        'legislation_act', 'Lookup table that contains a list of legislated Acts; i.e. "Mines Act", "Health, Safety and Reclamation Code for Mines in BC", "Mineral Tenure Act".')
    op.create_table_comment('legislation_compliance_article', 'Contains the long description for each provision of the parent Act and is used to describe which part of the Act/Code was found to be in noncompliance during an inspection. Data for this table was derived through the values in the compliance_article table in the NRIS database. Note, each description is related to a corresponding legislation_act_section and parent Act. I.e. For section 1.9.1 of the HSRC, the description is ""The manager shall (1) take all reasonable and practicable measures to ensure that the workplace is free of potentially hazardous agents and conditions which could adversely affect the health, safety, or well-being of the workers')
    op.create_table_comment('location', 'Contains the location details of stops added for General Observations and Areas Inspected. Location may include a general mine location or specific location details of where the infraction took place (i.e. tailings dam)')
    op.create_table_comment('nris_raw_data', 'Contains the raw XML data pulled in from the CORS_CV_ASSESSMENTS_XVW view from the NRIS database. The nris_data is then parsed out into the relational based tables within the nris schema for easier reporting and data output.')
    op.create_table_comment('document', 'A document is any type of additional documentation that has been generated during the INSPECTION process and is attached as part of the INSPECTION record. An example would be a photograph that was taken of the effluent being released during the inspection.')
    op.create_table_comment(
        'inspection', 'An inspection, otherwise known as a type of ASSESSMENT in NRIS, is an activity carried out by Mines Inspectors to ensure a Mine, and its relating mining activities, are in compliance with regulations in BC.')
    op.create_table_comment(
        'inspection_type', 'Categories of mine inspection types. This most directly related to the type of inspector and does not constrain potential resulting orders.')
    op.create_table_comment('legislation_act_section',
                            'Contains a list of sections (or provisions of the act); i.e. "1.9.1", "1.5.1", etc.')
    op.create_table_comment('inspected_location', 'Contains the high-level details of an observation(s) found during an inspection. Note, one observation is either a ""Stop"" or ""General"", each observation can result in one or more ""types of observations"", i.e. documents being issued (order, warning, advisory, request).')
    op.create_table_comment('inspection_document_xref',
                            'Contains a reference between inspection documents and the details of the documents.')
    op.create_table_comment('inspected_location_document_xref',
                            'Contains a reference between inspected location documents and the details of the documents.')
    op.create_table_comment('order_advisory_detail', 'For each inspection observation, this table contains details of advisories issued by an inspector. An advisory is a written notification to a person that draws attention to a specific regulatory requirement. An advisory is used where the proponent is in compliance at the moment of inspection but may be at risk of future non-compliance.')
    op.create_table_comment('order_request_detail', 'For each inspection observation, this table contains requests from the inspector to the Chief Gold Commissioner to issue an order under the Mineral Tenure Act or the Coal Act. Also included are responses to the issued orders.')
    op.create_table_comment('order_stop_detail', 'For each inspection observation, this table contains details of an order issued by an inspector. An order is a written, legal instrument issued by an inspector to address non-compliance with a Regulatory Requirement and/or to reduce and manage risk. This is the most common C&E tool that will be used by inspectors in all disciplines.')
    op.create_table_comment('order_warning_detail', 'For each inspection observation, this table contains details of a warning issued by an inspector.  A warning is a written notification to a person that is not in compliance with a specific Regulatory Requirement at the time of inspection.')
    op.create_table_comment('order_stop_detail_document_xref',
                            'Contains a reference between order documents and the details of the documents.')
    op.create_table_comment('noncompliance_legislation',
                            'Contains the additional details about the contravention(s) relating to an issued order; i.e. estimated incident date, noncompliance description, regulations/act contravened.')
    op.create_table_comment(
        'noncompliance_permit', 'For an issued order, this table contains the additional details about the permit conditions found to be in non-compliance.')


def downgrade():
    op.drop_table_comment('document_type')
    op.drop_table_comment('inspected_location_type')
    op.drop_table_comment('inspection_status')
    op.drop_table_comment('legislation_act')
    op.drop_table_comment('legislation_compliance_article')
    op.drop_table_comment('location')
    op.drop_table_comment('nris_raw_data')
    op.drop_table_comment('document')
    op.drop_table_comment('inspection')
    op.drop_table_comment('inspection_type')
    op.drop_table_comment('legislation_act_section')
    op.drop_table_comment('inspected_location')
    op.drop_table_comment('inspection_document_xref')
    op.drop_table_comment('inspected_location_document_xref')
    op.drop_table_comment('order_advisory_detail')
    op.drop_table_comment('order_request_detail')
    op.drop_table_comment('order_stop_detail')
    op.drop_table_comment('order_warning_detail')
    op.drop_table_comment('order_stop_detail_document_xref')
    op.drop_table_comment('noncompliance_legislation')
    op.drop_table_comment('noncompliance_permit')
