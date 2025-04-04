from unittest.mock import MagicMock

import pytest
from app.pipelines.permit_condition_search.components.context_enricher import (
    ContextEnricher,
)
from haystack import Document


@pytest.fixture
def mock_document_store():
    store = MagicMock()
    return store


@pytest.fixture
def enricher(mock_document_store):
    return ContextEnricher(document_store=mock_document_store)


def create_test_document(doc_id, content, meta=None):
    return Document(
        content=content,
        id=doc_id,
        meta=meta or {}
    )


def test_batch_creation():
    enricher = ContextEnricher(document_store=MagicMock())
    items = list(range(10))
    batches = enricher._batch(items, batch_size=3)
    assert len(batches) == 4
    assert batches == [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]


def test_collect_all_related_ids():
    enricher = ContextEnricher(document_store=MagicMock())
    docs = [
        create_test_document(
            "doc1",
            "test content",
            {
                "parent_ids": ["parent1", "parent2"],
                "sibling_ids": ["sib1", "sib2", "sib3", "sib4", "sib5"],
                "child_ids": ["child1", "child2", "child3"],
            }
        )
    ]

    parent_ids, sibling_ids, child_ids = enricher._collect_all_related_ids(docs, max_levels=None)
    
    assert parent_ids == {"parent1", "parent2"}
    assert len(sibling_ids) <= 4
    assert child_ids == {"child1", "child2"}


def test_format_context_chain():
    enricher = ContextEnricher(document_store=MagicMock())
    
    parents = [
        create_test_document("parent1", "Parent 1", {"step": "A", "step_path": "A"}),
        create_test_document("parent2", "Parent 2", {"step": "1", "step_path": "A.1"})
    ]
    
    siblings = [
        create_test_document("sib1", "Sibling 1", {"step": "2", "step_path": "A.2"})
    ]
    
    children = [
        create_test_document("child1", "Child 1", {"step": "a", "step_path": "A.1.a"}),
        create_test_document("child2", "Child 2", {"step": "b", "step_path": "A.1.b"})
    ]
    
    context = enricher._format_context_chain(parents, siblings, children)
    
    assert context["full_hierarchy"] == ["A", "A.1"]
    assert len(context["parent_contexts"]) == 2
    assert len(context["sibling_contexts"]["next"]) == 1
    assert len(context["child_contexts"]) == 2


def test_run_integration(mock_document_store):
    related_docs = {
        "parent1": create_test_document("parent1", "Parent 1", {"step": "A", "step_path": "A"}),
        "sib1": create_test_document("sib1", "Sibling 1", {"step": "2", "step_path": "A.2"}),
        "child1": create_test_document("child1", "Child 1", {"step": "a", "step_path": "A.1.a"})
    }
    
    mock_document_store.filter_documents.return_value = list(related_docs.values())
    
    enricher = ContextEnricher(document_store=mock_document_store)
    
    test_doc = create_test_document(
        "doc1",
        "Test Document",
        {
            "parent_ids": ["parent1"],
            "sibling_ids": ["sib1"],
            "child_ids": ["child1"]
        }
    )
    
    result = enricher.run([test_doc])
    enriched_doc = result["documents"][0]
    
    assert "context" in enriched_doc.meta
    assert enriched_doc.meta["context"]["parent_contexts"]
    assert enriched_doc.meta["context"]["sibling_contexts"]
    assert enriched_doc.meta["context"]["child_contexts"]


def test_run_with_empty_relationships(mock_document_store):
    enricher = ContextEnricher(document_store=mock_document_store)
    test_doc = create_test_document("doc1", "Test Document", {})
    
    result = enricher.run([test_doc])
    assert result["documents"][0] == test_doc
    assert mock_document_store.filter_documents.call_count == 0


def test_run_with_max_levels(mock_document_store):
    enricher = ContextEnricher(document_store=mock_document_store)
    test_doc = create_test_document(
        "doc1",
        "Test Document",
        {
            "parent_ids": ["parent1", "parent2", "parent3"],
            "sibling_ids": ["sib1"],
            "child_ids": ["child1"]
        }
    )
    
    enricher.run([test_doc], max_levels=2)
    
    # Verify that filter_documents was called with only 2 parent IDs
    filter_query = mock_document_store.filter_documents.call_args[1]["filters"]
    assert len([id for id in filter_query["conditions"][0]["value"] if id.startswith("parent")]) == 2
