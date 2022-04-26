import pylightxl as xl
import tempfile

from werkzeug.exceptions import NotFound
from flask import request
from flask_restplus import Resource
from sheet2dict import Worksheet

from app.api.utils.custom_reqparser import CustomReqparser
from werkzeug.datastructures import FileStorage

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class ProjectSummaryDocumentUploadResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'file',
        location='files',
        type=FileStorage,
        required=False,
    )

    @api.doc(
        description='Request a document_manager_guid for uploading a document',
        params={'project_guid': 'The GUID of the project the Project Summary Document belongs to.'})
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def post(self, project_guid, project_summary_guid):
        mine_guid = request.args.get('mine_guid', type=str)
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'project_summaries')

    @api.doc(
        description='Import IRT',
        params={'project_guid': 'The GUID of the project the Project Summary Document belongs to.'})
    @api.expect(parser)
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def put(self, project_guid, project_summary_guid):
        data = self.parser.parse_args()
        import_file = data.get('file')
        print(f'FILE: {import_file}')
        temp_file = tempfile.NamedTemporaryFile(suffix='.xlsx')
        temp_file.write(import_file.read())
        print(f'Temp file: {temp_file}')
        excel_dict = Worksheet()
        excel_dict.xlsx_to_dict(path=temp_file.file, select_sheet='Sheet1')
        print(f'EXCEL HEADERS: {excel_dict.header}')
        # print(f'EXCEL CONTENT: {excel_dict.sanitized_sheet_items}')
        formatted_excel_dict = []
        for dict in excel_dict.sheet_items:
            information = dict.get('Information')
            f_info = f'{information.decode("utf-8", "ignore")}'
            required = dict.get('Required', False)
            methods = dict.get('Methods', False)
            comments = dict.get('Comments')
            formatted_excel_dict.append({
                'information': f_info,
                'required': required,
                'methods': methods,
                'comments': comments
            })
        print(f'FORMATTED LIST: {formatted_excel_dict}')
        temp_file.close()
        return
