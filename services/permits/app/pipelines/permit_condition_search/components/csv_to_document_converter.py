import csv
from pathlib import Path
from typing import Any, Dict, List, Optional

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
        Convert CSV file to list of document objects
        Returns: List of dicts with 'text' and 'meta' properties
        """
        documents = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    
                    if row.get('invalid'):
                        raise Exception(f"Invalid row found in CSV file: {row}")
                    # Extract condition text
                    condition_text = row.pop('condition', '')
                    id = row.pop('id', None)
                    
                    document_meta = {
                         k: v for k, v in row.items() if v
                    }
                    # Create document object
                    document = Document(content=condition_text, meta=document_meta, id=id)
                        

                    documents.append(document)
                    
        except FileNotFoundError:
            raise Exception(f"CSV file not found at: {file_path}")
        except csv.Error as e:
            raise Exception(f"Error processing CSV file: {str(e)}")
            
        return {"documents": documents}