import json
from unittest.mock import patch, MagicMock
from tests.now_application_factories import NOWApplicationIdentityFactory
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from tests.factories import MineDocumentFactory

def test_get_now_application_document_search_status(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    
    with patch('app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled', return_value=True), \
         patch('app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.get_index_status') as mock_get_status:
        
        mock_get_status.return_value = {'status': 'success'}
        
        resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index/status',
            headers=auth_headers['full_auth_header']
        )
        
        assert resp.status_code == 200
        assert resp.json == {'status': 'success'}

def test_post_now_application_document_index(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    mine_doc = MineDocumentFactory(mine=now_application_identity.mine)
    
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_doc.mine_document_guid,
        now_application_document_type_code='OTH'
    )
    db_session.add(xref)
    db_session.commit()
    
    with patch('app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled', return_value=True), \
         patch('app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.index_documents') as mock_index:
        
        mock_index.return_value = {'status': 'running', 'queued': 1}
        
        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index',
            headers=auth_headers['full_auth_header']
        )
        
        assert resp.status_code == 200
        assert resp.json == {'status': 'running', 'queued': 1}

def test_post_now_application_document_search(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    
    with patch('app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled', return_value=True), \
         patch('app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.search') as mock_search:
        mock_search.return_value = [b'event: documents\ndata: {"results": []}\n\n']
        
        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search',
            json={'query': 'test'},
            headers=auth_headers['full_auth_header']
        )
        
        assert resp.status_code == 200
        assert resp.mimetype == 'text/event-stream'

def test_delete_now_application_document_index(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    
    with patch('app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled', return_value=True), \
         patch('app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.cancel_indexing') as mock_cancel:
        
        mock_cancel.return_value = {'message': 'cancelled'}
        
        resp = test_client.delete(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index',
            headers=auth_headers['full_auth_header']
        )
        
        assert resp.status_code == 200
        assert resp.json == {'message': 'cancelled'}

def test_collect_indexable_documents_filters_spatial(db_session):
    from app.api.now_applications.resources.now_application_document_search_resource import _collect_indexable_documents
    now_application_identity = NOWApplicationIdentityFactory()
    now_app = now_application_identity.now_application
    mine = now_application_identity.mine
    
    # Valid document
    doc1 = MineDocumentFactory(mine=mine, document_name='report.pdf')
    xref1 = NOWApplicationDocumentXref(
        now_application_id=now_app.now_application_id, 
        mine_document=doc1,
        now_application_document_type_code='OTH'
    )
    
    # Spatial document (should be filtered)
    doc2 = MineDocumentFactory(mine=mine, document_name='map.shp')
    xref2 = NOWApplicationDocumentXref(
        now_application_id=now_app.now_application_id, 
        mine_document=doc2,
        now_application_document_type_code='OTH'
    )
    
    # Deleted document (should be filtered)
    doc3 = MineDocumentFactory(mine=mine, document_name='old.pdf')
    doc3.deleted_ind = True
    xref3 = NOWApplicationDocumentXref(
        now_application_id=now_app.now_application_id, 
        mine_document=doc3,
        now_application_document_type_code='OTH'
    )
    
    now_app.documents = [xref1, xref2, xref3]
    
    documents = _collect_indexable_documents(now_app)
    
    assert len(documents) == 1
    assert documents[0]['document_name'] == 'report.pdf'
