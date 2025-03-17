#!/usr/bin/env python3
import argparse
import json
import logging
import sys
from typing import Any, Dict

from document_structure_visualizer import visualize_document_structure

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def load_document(file_path: str) -> Dict[str, Any]:
    """
    Load a document from a JSON file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Document dictionary
    """
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        sys.exit(1)
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON file: {file_path}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='Visualize document structure from Document Intelligence API')
    parser.add_argument('document_path', help='Path to the JSON file containing the Document Intelligence response')
    parser.add_argument('--output', '-o', help='Output file path (if not provided, prints to stdout)')
    
    args = parser.parse_args()
    
    # Load document
    document = load_document(args.document_path)
    
    # Visualize structure
    structure = visualize_document_structure(document)
    
    # Output result
    if args.output:
        try:
            with open(args.output, 'w') as f:
                f.write(structure)
            logger.info(f"Document structure written to {args.output}")
        except Exception as e:
            logger.error(f"Error writing to output file: {e}")
            sys.exit(1)
    else:
        print(structure)


if __name__ == "__main__":
    main()
