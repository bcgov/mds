import tempfile

from flask_restplus import Resource
from flask import request
from sheet2dict import Worksheet

from app.api.utils.custom_reqparser import CustomReqparser
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import MINE_ADMIN, requires_any_of, MINESPACE_PROPONENT
from app.api.projects.response_models import IRT_MODEL
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.projects.information_requirements_table.models.requirements import Requirements


class InformationRequirementsTableListResource(Resource, UserMixin):
    def convert_boolean_string(self, boolean_string):
        return {'True': True, 'False': False}.get(boolean_string, False)

    # Only create new requirements when row has filled in required/methods or comments
    def build_irt_payload_from_excel(self, import_file, project_guid):
        temp_file = tempfile.NamedTemporaryFile(suffix='.xlsx')
        temp_file.write(import_file.read())
        excel_dict = Worksheet()
        excel_dict.xlsx_to_dict(path=temp_file.file, select_sheet='Sheet1')
        # Retrieve all valid requirements to cross reference with worksheet "Information" cell content
        import_errors = []
        sanitized_irt_requirements = []
        valid_requirements = Requirements.get_all()
        valid_requirement_descriptions = [
            requirement.description.strip().lower() for requirement in valid_requirements
        ]

        # Start parsing at specific row to avoid metadata in template
        starting_row_number = 7
        worksheet_to_parse = excel_dict.sanitize_sheet_items[starting_row_number:]
        for idx, row in enumerate(worksheet_to_parse):
            ## Parse requirements.description from "Information" cell in spreadsheet and cross reference with DB source of truth to determine validity
            information_cell = row.get('Information', '')
            # Split Information cell on spaces to separate out description from appendix prefix
            information_cell_split = information_cell.split()
            # Rejoin words with spaces after removing appendix reference
            sanitized_information_cell = ' '.join(information_cell_split[1:]).strip().lower()
            information_cell_is_valid = valid_requirement_descriptions.count(
                sanitized_information_cell) > 0

            required_cell = self.convert_boolean_string(row.get('Required'))
            methods_cell = self.convert_boolean_string(row.get('Methods'))
            comments_cell = row.get('Comments')
            # Add 2 to offset zero-based "idx" and starting_row_number beginning at table header
            row_number = idx + starting_row_number + 2
            # If "Information" cell entry is not valid flag that to user(could have a bad template or added custom rows)
            if information_cell_is_valid is False:
                import_errors.append(
                    f'Row {row_number} - "{" ".join(information_cell_split[1:]).strip()}" is not a valid entry in the Information column.'
                )
                continue
            # If "Required" or "Methods" cell entry is true and "Comments" are 'None' add error
            if (required_cell is True or methods_cell is True) and comments_cell == 'None':
                import_errors.append(
                    f'Row {row_number} - "Required" or "Methods" cells is checked off and requires "Comments" to be provided.'
                )
                continue

            is_empty_row = required_cell is False and methods_cell is False and comments_cell == 'None'
            active_requirement = [
                requirement for requirement in valid_requirements
                if requirement.description.strip().lower() == sanitized_information_cell
            ]
            is_row_top_level_category = True if active_requirement[
                0].parent_requirement_id is None else False
            # If the "Information" requirement provided does not match DB, an empty row is provided, or the row contains a top level category do not create a requirement
            if active_requirement and is_empty_row is False and is_row_top_level_category is False:
                new_requirement_dict = {
                    'information': sanitized_information_cell,
                    'requirement_guid': active_requirement[0].requirement_guid,
                    'required': required_cell,
                    'methods': methods_cell,
                    'comments': comments_cell
                }
                sanitized_irt_requirements.append(new_requirement_dict)

        if import_errors:
            formatted_import_errors = ',\\n'.join(import_errors)
            raise BadRequest(
                f'The following validation errors occurred during import: {formatted_import_errors}.'
            )

        new_information_requirements_table = InformationRequirementsTable._schema().load({
            'project_guid':
            project_guid,
            'status_code':
            'REC',
            'requirements':
            sanitized_irt_requirements
        })
        new_information_requirements_table.save()

        temp_file.close()
        return new_information_requirements_table

    parser = CustomReqparser()
    parser.add_argument(
        'file',
        location='files',
        type=FileStorage,
        required=True,
    )

    @api.doc(
        description='Create a new Information Requirements Table (IRT).',
        params={'project_guid': 'GUID of the project associated to a IRT'})
    @api.expect(IRT_MODEL)
    @api.marshal_with(IRT_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    def post(self, project_guid):
        data = self.parser.parse_args()
        import_file = data.get('file')
        try:
            existing_irt = InformationRequirementsTable.find_by_project_guid(project_guid)
            if existing_irt:
                raise BadRequest('Cannot import IRT, this project already has one imported')
            new_information_requirements_table = self.build_irt_payload_from_excel(
                import_file, project_guid)
            return 201, new_information_requirements_table
        except BadRequest as err:
            raise err
