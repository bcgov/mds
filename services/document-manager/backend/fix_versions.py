from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document_version import DocumentVersion
from app.docman.models.document import Document
from app.extensions import db
from app.utils.include.user_info import User

def fix_all_versions():
    oss = ObjectStoreStorageService()
    
    # We set test_mode to True so that User().get_user_username() uses DUMMY_AUTH_CLAIMS
    # instead of trying to read the JWT auth headers, thereby avoiding the out-of-context error.
    User._test_mode = True
    
    with db.session.no_autoflush:
        documents = db.session.query(Document).join(DocumentVersion).distinct().all()
        print(f"Found {len(documents)} documents with versions to check.")

        for doc in documents:
            try:
                s3_versions_resp = oss.list_versions(doc.object_store_path)
                # Filter for exact key match and sort by LastModified ascending
                s3_versions = [v for v in s3_versions_resp.get('Versions', []) if v['Key'] == doc.object_store_path]
                s3_versions.sort(key=lambda x: x['LastModified'])
            except Exception as e:
                print(f"  ERROR fetching S3 versions for {doc.document_guid}: {e}")
                continue
            
            # Get DB versions sorted by created_date ascending
            db_versions = db.session.query(DocumentVersion).filter_by(document_guid=doc.document_guid).order_by(DocumentVersion.created_date).all()
            
            if len(s3_versions) != len(db_versions) + 1:
                print(f"  WARNING: Version count mismatch for {doc.document_guid}. S3:{len(s3_versions)}, DB:{len(db_versions)}+1. Skipping.")
                continue

            # The db_versions represent the historical snapshots (S1, S2, ..., Sn-1)
            # The current Document record represents the latest version (Sn)
            
            for i, db_v in enumerate(db_versions):
                s3_v = s3_versions[i]
                s3_date = s3_v['LastModified'].replace(tzinfo=None)
                s3_id = s3_v['VersionId']

                # We only update if there's a change needed
                if db_v.object_store_version_id != s3_id:
                    print(f"[{doc.document_guid}] FIXING V{i+1}: Name: {db_v.file_display_name} | Old ID: {db_v.object_store_version_id} -> New ID: {s3_id}")
                    db_v.object_store_version_id = s3_id
                    # Also update dates to match S3 truth
                    db_v.upload_completed_date = s3_date
                    db.session.add(db_v)

            # Check the current Document record against the latest S3 version
            latest_s3_version = s3_versions[-1]
            latest_s3_date = latest_s3_version['LastModified'].replace(tzinfo=None)
            
            # Since Document doesn't store object_store_version_id, we just check metadata/dates if needed
            if doc.upload_completed_date != latest_s3_date:
                print(f"[{doc.document_guid}] UPDATING Current Doc Date: {doc.upload_completed_date} -> {latest_s3_date}")
                doc.upload_completed_date = latest_s3_date
                db.session.add(doc)

        try:
            print("Summary of changes prepared. Committing...")
            db.session.commit()
            print("Commit successful.")
        except Exception as e:
            print(f"CRITICAL ERROR: Failed to commit to database: {e}")
            db.session.rollback()

if __name__ == "__main__":
    from app import create_app
    app = create_app()
    with app.app_context():
        fix_all_versions()