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
        invalid_reqs = []

        # Start parsing at specific row to avoid metadata in template
        worksheet_to_parse = excel_dict.sanitize_sheet_items[7:]
        for row in worksheet_to_parse:
            ## Parse requirements.description from "Information" cell in spreadsheet and cross reference with DB source of truth to determine validity
            information_cell = row.get('Information', '')
            # Split Information cell on spaces to separate out description from appendix prefix
            information_cell_split = information_cell.split()
            # Rejoin words with spaces after removing appendix reference
            sanitized_information_cell = ' '.join(information_cell_split[1:]).strip().lower()
            information_cell_is_valid = valid_requirement_descriptions.count(
                sanitized_information_cell) > 0
            # If "Information" cell entry is not valid flag that to user(could have a bad template or added custom rows)
            if information_cell_is_valid is False:
                import_errors.append(
                    f'"{sanitized_information_cell}" is not a valid entry in the Information column'
                )
                continue

            required_cell = row.get('Required', False)
            methods_cell = row.get('Methods', False)
            comments_cell = row.get('Comments', False)
            # If no information is provided on cell do not include it in the DB insert
            if required_cell is 'None' and methods_cell is 'None' and comments_cell is 'None':
                print(f'Not included!!! {row}')
                continue

            # print(valid_requirement_descriptions.count(sanitized_information_cell))
            # print(f'VALID INFO: {information_cell_is_valid}')
            # print(f'SANITZED INFO: {sanitized_information_cell}')
            # print(f'SOURCE INFO: {valid_requirements[0].description.strip().lower()}')
            active_requirement = [
                requirement for requirement in valid_requirements
                if requirement.description.strip().lower() == sanitized_information_cell
            ]
            # print(f'ACTIVE REQ: {active_requirement}')
            if active_requirement and information_cell_is_valid:
                print(f'REQ: {active_requirement} VALID: {information_cell_is_valid}')
                new_requirement_dict = {
                    'requirement_guid': active_requirement[0].requirement_guid,
                    'required': required_cell,
                    'methods': methods_cell,
                    'comments': comments_cell
                }
                sanitized_irt_requirements.append(new_requirement_dict)

        # print(f'INVALID: {invalid_reqs}')

        # new_information_requirements_table = InformationRequirementsTable._schema().load({
        #     'project_guid':
        #     project_guid,
        #     'status_code':
        #     'REC',
        #     'requirements':
        #     sanitized_irt_requirements
        # })
        # new_information_requirements_table.save()

        # temp_file.close()
        # print(f'Sanitized Output: {sanitized_irt_requirements}')
        # if import_errors is not None:
        #     return BadRequest(
        # f'The following validation errors occurred on import: \n{import_errors.join("\n")}')
        return 201

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
        # irt = InformationRequirementsTable._schema().load(request.json['irt'])
        data = self.parser.parse_args()
        import_file = data.get('file')
        self.build_irt_payload_from_excel(import_file, project_guid)
        # irt.save()

        return 201