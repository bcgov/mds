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
    # If not filled in use default requirement
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
        # Create new Information Requirements Table object(needed for FK on Requirements)
        new_information_requirements_table = InformationRequirementsTable._schema().load({
            'project_guid':
            project_guid,
            'status_code':
            'REC',
            'requirements': []
        })
        new_information_requirements_table.save()

        # Start parsing at specific row to avoid metadata in template
        worksheet_to_parse = excel_dict.sanitize_sheet_items[7:]
        for row in worksheet_to_parse:
            information_cell = row.get('Information', '')
            # Split on spaces
            information_cell_split = information_cell.split()
            # Rejoin words with spaces after removing appendix reference
            sanitized_information_cell = ' '.join(information_cell_split[1:]).strip().lower()
            print(f'SANITZED INFO: {sanitized_information_cell}')
            information_cell_is_valid = valid_requirement_descriptions.count(
                sanitized_information_cell) > 0
            print(valid_requirement_descriptions.count(sanitized_information_cell))
            print(f'VALID INFO: {information_cell_is_valid}')
            if information_cell_is_valid is False:
                return invalid_reqs.append(sanitized_information_cell)
            active_requirement = [
                requirement for requirement in valid_requirements if ' '.join(
                    requirement.description[1:]).strip().lower() == sanitized_information_cell
            ]
            print(f'ACTIVE REQ: {active_requirement}')
            # new_requirement_dict = {'irt_guid': new_information_requirements_table.irt_guid}
            # return sanitized_irt_requirements.append(new_requirement_dict)

        print(f'INVALID: {invalid_reqs}')
        temp_file.close()
        if import_errors is not None:
            return BadRequest(
                f'The following validation errors occurred on import: \n{import_errors.join("\n")}')
        return sanitized_irt_requirements

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
        print(f'IMPORT FILE: {import_file}')
        self.build_irt_payload_from_excel(import_file, project_guid)
        # irt.save()

        return 201