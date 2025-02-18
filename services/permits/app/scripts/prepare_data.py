import logging
from datetime import datetime
from pathlib import Path

import pandas as pd
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.extensions import db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataPreparation:
    def __init__(self, csv_path):
        self.csv_path = Path(csv_path)

    def read_csv(self):
        try:
            df = pd.read_csv(self.csv_path)
            required_columns = [
                'mine_no', 'mine_name', 'permit_no', 'issue_date',
                'document_name', 'document_manager_guid',
                'permit_amendment_guid', 'object_store_path'
            ]
            missing_cols = [col for col in required_columns if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            return df
        except Exception as e:
            logger.error(f"Error reading CSV file: {e}")
            raise

    def find_or_create_mine(self, mine_no, mine_name):
        """Find existing mine or create new one"""
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
        return mine

    def find_or_create_permit(self, mine, permit_no):
        """Find existing permit or create new one"""
        permits = [p for p in mine.mine_permit if p.permit_no == permit_no]
        if not permits:
            logger.info(f"Creating new permit: {permit_no} for mine {mine.mine_no}")
            permit = Permit.create(
                mine=mine,
                permit_no=permit_no,
                permit_status_code='ACT',  # Default status
                is_exploration=False,  # Default value
                exemption_fee_status_code=None,
                exemption_fee_status_note=None
            )
            db.session.commit()
            return permit
        return permits[0]

    def find_or_create_amendment(self, permit, mine, issue_date, permit_amendment_guid):
        """Find existing amendment or create new one"""
        amendments = [
            a for a in permit.permit_amendments 
            if str(a.permit_amendment_guid) == permit_amendment_guid
        ]
        
        if not amendments:
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
            return amendment
        return amendments[0]

    def process_data(self):
        df = self.read_csv()
        grouped = df.groupby(['mine_no', 'mine_name', 'permit_no', 'issue_date', 'permit_amendment_guid'])
        
        for (mine_no, mine_name, permit_no, issue_date, permit_amendment_guid), group in grouped:
            try:
                # Convert issue_date string to datetime
                issue_date = pd.to_datetime(issue_date).date()

                # Process mine
                mine = self.find_or_create_mine(mine_no, mine_name)

                # Process permit 
                permit = self.find_or_create_permit(mine, permit_no)

                # Process amendment
                amendment = self.find_or_create_amendment(permit, mine, issue_date, permit_amendment_guid)

                logger.info(f"Processed: Mine {mine_no}, Permit {permit_no}, Amendment {permit_amendment_guid}")

            except Exception as e:
                logger.error(f"Error processing row: {e}")
                continue

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Prepare database records from CSV')
    parser.add_argument('--csv', required=True, help='Path to CSV file')
    
    args = parser.parse_args()
    
    processor = DataPreparation(args.csv)
    processor.process_data()

if __name__ == "__main__":
    main()
