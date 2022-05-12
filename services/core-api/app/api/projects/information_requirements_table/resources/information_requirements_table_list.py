import tempfile

from flask_restplus import Resource
from flask import request
from sheet2dict import Worksheet

from app.api.utils.custom_reqparser import CustomReqparser
from werkzeug.datastructures import FileStorage

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import MINE_ADMIN, requires_any_of, MINESPACE_PROPONENT
from app.api.projects.response_models import IRT_MODEL
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable


class InformationRequirementsTableListResource(Resource, UserMixin):
    def build_irt_payload_from_excel(self, import_file):
        print(f'FILE: {import_file}')
        temp_file = tempfile.NamedTemporaryFile(suffix='.xlsx')
        temp_file.write(import_file.read())
        print(f'Temp file: {temp_file}')
        excel_dict = Worksheet()
        excel_dict.xlsx_to_dict(path=temp_file.file, select_sheet='Sheet1')
        print(f'EXCEL HEADERS: {excel_dict.header}')
        print(f'EXCEL CONTENT: {excel_dict.sheet_items}')

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
        self.build_irt_payload_from_excel(import_file)
        # irt.save()

        return 201