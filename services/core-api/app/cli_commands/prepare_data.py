import csv
import io
import logging
from datetime import datetime
from pathlib import Path

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import (
    PermitAmendmentDocument,
)
from app.api.services.document_manager_service import DocumentManagerService
from app.extensions import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataPreparation:
    def __init__(self, csv_path, token):
        self.csv_path = Path(csv_path)
        # Cache for tracking what's been created
        self.mine_cache = {}
        self.permit_cache = {}
        self.amendment_cache = {}
        self.token = token

    def read_csv(self):
        try:
            required_columns = [
                'mine_no', 'mine_name', 'permit_no', 'issue_date',
                'document_name', 'document_manager_guid',
                'permit_amendment_guid', 'object_store_path'
            ]
            
            with open(self.csv_path, 'r') as f:
                reader = csv.DictReader(f)
                # Validate columns
                missing_cols = [col for col in required_columns if col not in reader.fieldnames]
                if missing_cols:
                    raise ValueError(f"Missing required columns: {missing_cols}")
                
                # Group records by unique combinations
                grouped_data = {}
                for row in reader:
                    key = (row['mine_no'], row['mine_name'], row['permit_no'], 
                          row['issue_date'], row['permit_amendment_guid'])
                    if key not in grouped_data:
                        grouped_data[key] = []
                    grouped_data[key].append(row)
                
                return grouped_data
                
        except Exception as e:
            logger.error(f"Error reading CSV file: {e}")
            raise

    def find_or_create_mine(self, mine_no, mine_name):
        """Find existing mine or create new one"""
        if mine_no in self.mine_cache:
            return self.mine_cache[mine_no]

        mine = Mine.find_by_mine_no(mine_no)
        if not mine:
            logger.info(f"Creating new mine: {mine_name} ({mine_no})")
            mine = Mine(
                mine_no=mine_no,
                mine_name=mine_name,
                mine_region='SW'  # Default region, adjust as needed
            )
            db.session.add(mine)
            db.session.commit()

        self.mine_cache[mine_no] = mine
        return mine

    def find_or_create_permit(self, mine, permit_no):
        """Find existing permit or create new one"""
        if permit_no in self.permit_cache:
            permit = self.permit_cache[permit_no]
            # Check if we need to add mine association
            if mine.mine_guid not in [str(m.mine_guid) for m in permit._all_mines]:
                logger.info(f"Adding existing permit {permit_no} to mine {mine.mine_no}")
                permit._mine_associations.append(
                    MinePermitXref(
                        mine_guid=mine.mine_guid,
                        start_date=datetime.now()
                    )
                )

                permit.save()
                db.session.commit()

            return permit

        # First check if permit exists in database
        existing_permit = Permit.find_by_permit_no(permit_no)
        if existing_permit:
            self.permit_cache[permit_no] = existing_permit
            # Check if we need to add mine association
            if mine.mine_guid not in [str(m.mine_guid) for m in existing_permit._all_mines]:
                logger.info(f"Adding existing permit {permit_no} to mine {mine.mine_no}")
                existing_permit._mine_associations.append(
                    MinePermitXref(
                        mine_guid=mine.mine_guid,
                        start_date=datetime.now()
                    )
                )

                existing_permit.save()
                db.session.commit()
            return existing_permit
            
        # If no permit exists at all, create new one
        logger.info(f"Creating new permit: {permit_no} for mine {mine.mine_no}")
        permit = Permit.create(
            mine=mine,
            permit_no=permit_no,
            permit_status_code='O',  # Default status for historical permits
            is_exploration=False,  # Default value
            exemption_fee_status_code=None,
            exemption_fee_status_note=None
        )
        db.session.commit()
        self.permit_cache[permit_no] = permit
        return permit

    def find_or_create_amendment(self, permit, mine, issue_date, permit_amendment_guid):
        """Find existing amendment or create new one"""
        if permit_amendment_guid in self.amendment_cache:
            return self.amendment_cache[permit_amendment_guid]
        
        permit._context_mine = mine

        amendments = [
            a for a in permit.permit_amendments 
            if str(a.permit_amendment_guid) == permit_amendment_guid
        ]
        
        if amendments:
            amendment = amendments[0]
        else:
            logger.info(f"Creating new amendment for permit {permit.permit_no}")
            amendment = PermitAmendment.create(
                permit=permit,
                mine=mine,
                received_date=issue_date,
                issue_date=issue_date,
                authorization_end_date=None,  # Set as needed
                permit_amendment_type_code='AMD',
                description='Historical amendment imported from records',
                permit_amendment_status_code='ACT'
            )
            amendment.permit_amendment_guid = permit_amendment_guid
            db.session.commit()

        self.amendment_cache[permit_amendment_guid] = amendment
        return amendment

    def upload_and_create_document(self, row, mine, amendment):
        """Upload file to document manager and create permit amendment document"""
        try:
            document_guid = row['document_manager_guid']
            existing_doc = PermitAmendmentDocument.query.filter_by(
                document_manager_guid=document_guid, 
                deleted_ind=False
            ).first()

            if existing_doc:
                logger.info(f"Document already exists: {row['document_name']}")
                return existing_doc

            logger.info(f"Uploading and creating document record: {row['document_name']}")
            
            # Get local file path - use same directory structure but with filename
            object_path = Path(row['object_store_path'])
            local_path = self.csv_path.parent / '/'.join(object_path.parts[1:-1]) / row['document_name']

            if not local_path.exists():
                logger.error(f"Local file not found: {local_path}")
                return None

            # Read local file and upload to document manager
            with open(local_path, 'rb') as file_obj:
                file_content = file_obj.read()

                # Upload to document manager
                document_guid = DocumentManagerService.pushFileToDocumentManager(
                    file_content=file_content,
                    filename=row['document_name'],
                    mine=mine,
                    document_category='permits',
                    authorization_header=self.token,  # Replace with actual auth
                    headers={'Content-Type': 'application/json', 'Authorization': self.token}
                )

            if document_guid:
                # Create permit amendment document record
                doc = PermitAmendmentDocument(
                    permit_amendment_id=amendment.permit_amendment_id,
                    document_name=row['document_name'],
                    mine_guid=mine.mine_guid,
                    document_manager_guid=document_guid,
                )
                db.session.add(doc)
                db.session.commit()
                logger.info(f"Successfully created document: {row['document_name']}")
                return doc
            else:
                logger.error(f"Failed to upload document to document manager: {row['document_name']}")
                return None

        except Exception as e:
            logger.exception(f"Error handling document upload: {e}", e)
            raise

    def process_data(self):
        grouped_data = self.read_csv()

        mine_nos = set(mine_no for mine_no, _, _, _, _ in grouped_data.keys())

        mines = {}
        for mine_no in mine_nos:
            mine = Mine.find_by_mine_no(mine_no)
            if mine:
                mines[mine_no] = mine
        
        permits = {}
        for permit_no in set(permit_no for _, _, permit_no, _, _ in grouped_data.keys()):
            permit = Permit.find_by_permit_no(permit_no)
            if permit:
                permits[permit_no] = permit

        permit_amendment_guids = set(permit_amendment_guid for _, _, _, _, permit_amendment_guid in grouped_data.keys())

        amendments = {}
        for permit_amendment_guid in permit_amendment_guids:
            amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
            if amendment:
                amendments[permit_amendment_guid] = amendment

        
        for (mine_no, mine_name, permit_no, issue_date, permit_amendment_guid), group in grouped_data.items():
            try:
                # Convert issue_date string to datetime
                issue_date = datetime.strptime(issue_date, '%Y-%m-%d')

                mine = mines.get(mine_no)
                if not mine:
                    mine = self.find_or_create_mine(mine_no, mine_name)
                    mines[mine_no] = mine
                
                permit = permits.get(permit_no)
                if not permit:
                    permit = self.find_or_create_permit(mine, permit_no)

                    permit._context_mine = mine
                    permits[permit_no] = permit

                permit_amendment = amendments.get(permit_amendment_guid)
                if not permit_amendment:
                    permit_amendment = self.find_or_create_amendment(permit, mine, issue_date, permit_amendment_guid)
                    amendments[permit_amendment_guid] = permit_amendment
                logger.info(f"Processed: Mine {mine_no}, Permit {permit_no}, Amendment {permit_amendment_guid}")

                # Process documents for this amendment
                for row in group:
                    try:
                        doc = self.upload_and_create_document(row, mine, permit_amendment)
                        if doc:
                            logger.info(f"Processed document: {doc.document_name}")
                    except Exception as e:
                        logger.error(f"Error processing document: {e}")
                        continue

            except Exception as e:
                logger.exception(f"Error processing row: {e}", e)
                continue

def prepare_permit_data(csv_path, token):
    """Entry point for the CLI command"""
    processor = DataPreparation(csv_path, "Bearer "+ token)
    processor.process_data()
