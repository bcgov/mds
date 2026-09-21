from app.extensions import db
from sqlalchemy import text

def sync_versions():
    print("Syncing fixes from docman to Core API (mine_document and mine_document_version)...")
    
    try:
        sync_doc_sql = """
            UPDATE mine_document SET upload_date = d.upload_started_date, document_name = d.file_display_name
            FROM docman.document d
            WHERE mine_document.document_manager_guid = d.document_guid;
        """
        db.session.execute(text(sync_doc_sql))
        
        sync_ver_sql = """
            UPDATE mine_document_version SET document_name = dv.file_display_name, upload_date = dv.created_date
            FROM docman.document_version dv 
            WHERE mine_document_version.document_manager_version_guid = dv.id;
        """
        db.session.execute(text(sync_ver_sql))
        
        # Ensure strictly increasing upload dates in mine_document_version for UI sorting
        sort_sql = """
            WITH sorted_versions AS (
                SELECT 
                    mine_document_version_guid,
                    ROW_NUMBER() OVER (PARTITION BY mine_document_guid ORDER BY upload_date ASC, mine_document_version_guid ASC) as rn
                FROM mine_document_version
            )
            UPDATE mine_document_version
            SET upload_date = upload_date + (rn * interval '1 microsecond')
            FROM sorted_versions
            WHERE mine_document_version.mine_document_version_guid = sorted_versions.mine_document_version_guid;
        """
        db.session.execute(text(sort_sql))
        
        db.session.commit()
        print("Core API sync successful. All data aligned!")
        
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to commit to database: {e}")
        db.session.rollback()

if __name__ == "__main__":
    from app import create_app
    app = create_app()
    with app.app_context():
        sync_versions()