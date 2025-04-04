import csv
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from haystack import Document, component, logging

logger = logging.getLogger(__name__)


@component
class CSVToDocument:
    @component.output_types(documents=List[Document])
    def run(
        self,
        file_path: Path,
        meta: Optional[Dict[str, Any]] = None,
    ) -> dict:
        """
        Convert CSV file to list of document objects, one for each row. The 'condition' column is used as the text of the document, the 'id' column is used as the document id, and all other columns are used as meta data.
        Returns: List of dicts with 'text' and 'meta' properties
        """
        documents = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    
                    if row.get('invalid'):
                        raise HTTPException(500, f"Invalid row found in CSV file: {row}")

                    condition_text = row.pop('condition', '')
                    document_id = row.pop('id', None)
                    
                    document_meta = {
                         k: v for k, v in row.items() if v
                    }

                    document = Document(content=condition_text, meta=document_meta, id=document_id)
                    documents.append(document)
                    
        except FileNotFoundError:
            raise HTTPException(500, f"CSV file not found at: {file_path}")
        except csv.Error as e:
            raise HTTPException(500, f"Error processing CSV file: {str(e)}")
            
        return {"documents": documents}