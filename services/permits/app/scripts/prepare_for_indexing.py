import logging
import os
from pathlib import Path

import boto3
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentPreparation:
    def __init__(self, csv_path, s3_bucket, output_dir):
        self.csv_path = csv_path
        self.s3_bucket = s3_bucket
        self.output_dir = Path(output_dir)
        self.s3_client = boto3.client('s3', endpoint_url='https://nrs.objectstore.gov.bc.ca')

    def read_document_metadata(self):
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

    def download_file(self, object_key, target_path):
        if target_path.exists():
            logger.info(f"File already exists: {target_path}")
            return "exists"
            
        try:
            target_path.parent.mkdir(parents=True, exist_ok=True)
            self.s3_client.download_file(self.s3_bucket, object_key, str(target_path))
            logger.info(f"Downloaded {object_key} to {target_path}")
            return "success"
        except Exception as e:
            logger.error(f"Error downloading {object_key}: {e}")
            return "failed"

    def update_csv_metadata(self, df):
        csv_output = self.output_dir / 'documents_metadata.csv'
        
        if csv_output.exists():
            existing_df = pd.read_csv(csv_output)
            
            # Ensure 'download_status' column exists in both dataframes
            if 'download_status' not in existing_df.columns:
                existing_df['download_status'] = None
            if 'download_status' not in df.columns:
                df['download_status'] = None
                
            combined_df = pd.concat([existing_df, df])
            combined_df = combined_df.drop_duplicates(
                subset=['document_manager_guid'], 
                keep='last'
            )
        else:
            if 'download_status' not in df.columns:
                df['download_status'] = None
            combined_df = df
            
        return combined_df

    def process_documents(self):
        df = self.read_document_metadata()
        
        if 'download_status' not in df.columns:
            df['download_status'] = None
            
        combined_df = self.update_csv_metadata(df)
        
        for index, row in combined_df.iterrows():
            # Get the directory path without the filename
            object_path = Path(row['object_store_path'])
            target_dir = self.output_dir / '/'.join(object_path.parts[1:-1])
            
            # Use document_name for the output file
            target_path = target_dir / row['document_name']
            
            # Only download if status is None or failed
            if pd.isna(row['download_status']) or row['download_status'] == 'failed':
                status = self.download_file(row['object_store_path'], target_path)
                combined_df.at[index, 'download_status'] = status
        
        # Save the final status
        combined_df.to_csv(self.output_dir / 'documents_metadata.csv', index=False)
        logger.info("Updated metadata file with download status")

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Prepare documents for indexing')
    parser.add_argument(
        '--csv', 
        required=True,
        dest='csv_path',
        help='Path to CSV file containing document metadata'
    )
    parser.add_argument(
        '--bucket', 
        required=True,
        dest='s3_bucket',
        help='S3 bucket name'
    )
    parser.add_argument(
        '--output', 
        required=True,
        dest='output_dir',
        help='Output directory for downloaded files'
    )
    
    args = parser.parse_args()
    
    processor = DocumentPreparation(args.csv_path, args.s3_bucket, args.output_dir)
    processor.process_documents()

if __name__ == "__main__":
    main()
