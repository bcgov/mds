import tempfile

from flask_restplus import Resource
from flask import request
from sheet2dict import Worksheet
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import MINE_ADMIN, requires_any_of, MINESPACE_PROPONENT
from app.api.projects.response_models import IRT_MODEL
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.projects.information_requirements_table.models.requirements import Requirements
from app.api.projects.project.models.project import Project


class InformationRequirementsTableListResource(Resource, UserMixin):
    @classmethod
    def convert_excel_boolean_string(self, boolean_string):
        return {'True': True, 'False': False}.get(boolean_string, False)

    @classmethod
    def get_parent_requirement_id(self, requirement):
        while requirement.parent_requirement_id is not None:
            requirement = Requirements.find_by_requirement_id(requirement.parent_requirement_id)
        return requirement

    # Only create new requirements when row has filled in required/methods or comments
    @classmethod
    def build_irt_payload_from_excel(cls, import_file):
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
            information_section = information_cell_split[0].split('.')
            sanitized_information_cell = ' '.join(information_cell_split[1:]).strip().lower()
            information_cell_is_valid = valid_requirement_descriptions.count(
                sanitized_information_cell) > 0
            required_cell = InformationRequirementsTableListResource.convert_excel_boolean_string(
                row.get('Required'))
            methods_cell = InformationRequirementsTableListResource.convert_excel_boolean_string(
                row.get('Methods'))
            comments_cell = row.get('Comments')

            comments_cell = None if comments_cell == 'None' else comments_cell
            # Add 2 to offset zero-based "idx" and starting_row_number beginning at table header
            row_number = idx + starting_row_number + 2
            # If "Information" cell entry is not valid, flag that to user(could have a bad template or added custom rows)
            if information_cell_is_valid is False:
                import_errors.append({
                    "row_number": row_number,
                    "section": int(information_section[0]),
                    "error": "INFORMATION_CELL_INVALID"
                })
                continue
            # If "Methods" cell entry is true and "Comments" are 'None' add error
            if methods_cell is True and comments_cell == None:
                import_errors.append({
                    "row_number": row_number,
                    "section": int(information_section[0]),
                    "error": "METHOD_TRUE_NEED_COMMENTS"
                })
                continue

            is_empty_row = required_cell is False and methods_cell is False and comments_cell == None
            temporal_active_requirements = [
                requirement for requirement in valid_requirements
                if requirement.description.strip().lower() == sanitized_information_cell
            ]
            active_requirement = []
            if len(temporal_active_requirements) > 1:
                for temporal_active_requirement in temporal_active_requirements:
                    parent = InformationRequirementsTableListResource.get_parent_requirement_id(
                        temporal_active_requirement)
                    if parent.requirement_id == int(information_section[0]):
                        active_requirement.append(temporal_active_requirement)
                    elif not parent and not information_section[1]:
                        active_requirement.append(temporal_active_requirement)
            else:
                active_requirement.extend(temporal_active_requirements)

            # If the "Information" requirement provided does not match DB, an empty row is provided, or the row contains a top level category do not create an irt_requirements_xref
            if active_requirement and is_empty_row is False:
                new_requirement_dict = {
                    'information': sanitized_information_cell,
                    'requirement_guid': active_requirement[0].requirement_guid,
                    'required': required_cell,
                    'methods': methods_cell,
                    'comment': comments_cell
                }
                sanitized_irt_requirements.append(new_requirement_dict)
        if import_errors:
            temp_file.close()
            raise BadRequest(import_errors)
        temp_file.close()
        return sanitized_irt_requirements

    @api.doc(
        description=
        'Import an Information Requirements Table (IRT) spreadsheet and create a new Information Requirements Table (IRT).',
        params={'project_guid': 'GUID of the project associated to a IRT'})
    @api.expect(IRT_MODEL)
    @api.marshal_with(IRT_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    def post(self, project_guid):
        import_file = request.files.get('file')
        document_guid = request.form.get('document_guid')

        try:
            project = Project.find_by_project_guid(project_guid)
            new_irt = None
            if project is None:
                raise BadRequest('Cannot import IRT, the project supplied cannot be found')

            existing_irt = InformationRequirementsTable.find_by_project_guid(project_guid)
            if existing_irt and existing_irt.status_code == 'SUB':
                raise BadRequest('Cannot import IRT, this project already has one imported')

            if import_file and document_guid:
                sanitized_irt_requirements = InformationRequirementsTableListResource.build_irt_payload_from_excel(
                    import_file)

                new_irt = InformationRequirementsTable.save_new_irt(project,
                                                                    sanitized_irt_requirements,
                                                                    import_file, document_guid)
            else:
                raise BadRequest(
                    'Cannot create a new IRT, requirements must be imported using the IRT template file.'
                )

            return new_irt, 201

        except BadRequest as err:
            raise err
