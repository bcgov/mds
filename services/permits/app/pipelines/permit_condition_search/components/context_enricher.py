from typing import Dict, List, Optional, Set, Tuple

from haystack import Document, component


@component
class ContextEnricher:
    """
    Enriches documents with parent, sibling, and child context. Why? to provide extra context to the LLM to be able to generate better responses.
    
    Example:

    Given this document hierarchy
        A. General <--- Parent: The enricher will fetch from Azure Search
            1. Condition 1 <---- A search matched on this condition
                a. Subcondition 1 <-- Child: The enricher will fetch from Azure Search
                b. Subcondition 2 <-- Child: The enricher will fetch from Azure Search
            2. Condition 2 <-- Sibling: The enricher will fetch from Azure Search
        B. Another section <-- Ignored

    The example above would yield this.
        {
            "full_hierarchy": ["A", "1"],
            "parent_contexts": {
                "level_1": {"id": "A", "content": "General", "step": "A", "hierarchy": "A"},
            },
            "sibling_contexts": {
                "previous": [],
                "next": [{"id": "2", "content": "Condition 2", "step": "2", "hierarchy": "A.2"}],
            },
            "child_contexts": [
                {"id": "a", "content": "Subcondition 1", "step": "a", "hierarchy": "A.1.a"},
                {"id": "b", "content": "Subcondition 2", "step": "b", "hierarchy": "A.1.b"},
            ],
        }
    
    """

    def __init__(self, document_store, batch_size: int = 100):
        self.document_store = document_store
        self.batch_size = batch_size

    def _format_context_chain(
        self,
        parents: List[Document],
        siblings: List[Tuple[str, Document]],
        children: List[Document],
    ) -> Dict[str, dict]:
        """
        Formats the context chain including parents, siblings, and children
        """
        context = {
            "full_hierarchy": [],
            "parent_contexts": {},
            "sibling_contexts": {"previous": [], "next": []},
            "child_contexts": [],
        }

        # Format parent contexts - use step_path instead of hierarchy_path
        for level, parent in enumerate(parents, 1):
            path = parent.meta.get("step_path", "")
            if path:
                context["full_hierarchy"].append(path)

            context["parent_contexts"][f"level_{level}"] = {
                "id": parent.id,
                "content": parent.content,
                "step": parent.meta.get("step", ""),
                "hierarchy": path,
            }

        # Format sibling contexts - use step_path
        for position, sibling in siblings:
            context["sibling_contexts"][position].append({
                "id": sibling.id,
                "content": sibling.content,
                "step": sibling.meta.get("step", ""),
                "hierarchy": sibling.meta.get("step_path", ""),
            })

        # Format child contexts - use step_path
        for child in children:
            context["child_contexts"].append(
                {
                    "id": child.id,
                    "content": child.content,
                    "step": child.meta.get("step", ""),
                    "hierarchy": child.meta.get("step_path", ""),
                }
            )

        return context

    def _batch(self, items: list, batch_size: int) -> List[List]:
        """Split a list into batches of specified size"""
        return [items[i : i + batch_size] for i in range(0, len(items), batch_size)]

    def _collect_all_related_ids(
        self, documents: List[Document], max_levels: Optional[int]
    ) -> Tuple[Set[str], Set[str], Set[str]]:
        """Collect all unique parent, sibling, and child IDs from documents"""
        parent_ids = set()
        sibling_ids = set()
        child_ids = set()

        for doc in documents:
            doc_parent_ids = doc.meta.get("parent_ids", [])
            if doc_parent_ids and max_levels:
                doc_parent_ids = doc_parent_ids[:max_levels]
            parent_ids.update(doc_parent_ids)

            # Collect sibling IDs
            doc_sibling_ids = doc.meta.get("sibling_ids", [])
            if doc_sibling_ids:
                # Take up to 2 siblings before and after
                mid = len(doc_sibling_ids) // 2
                selected_siblings = (
                    doc_sibling_ids[max(0, mid - 2) : mid]
                    + doc_sibling_ids[mid : mid + 2]
                )
                sibling_ids.update(selected_siblings)

            # Collect child IDs
            doc_child_ids = doc.meta.get("child_ids", [])
            if doc_child_ids:
                # Take up to 2 immediate children
                child_ids.update(doc_child_ids[:2])

        return parent_ids, sibling_ids, child_ids

    def _format_azure_search_filter(self, ids: List[str]) -> dict:
        """Convert list of IDs into Azure Search filter format"""
        return {
            "operator": "AND",
            "conditions": [{"field": "id", "operator": "in", "value": ids}],
        }

    def _fetch_documents_in_batches(self, doc_ids: Set[str]) -> Dict[str, Document]:
        """Fetch documents in batches from Azure AI Search"""
        doc_map = {}

        # Convert set to list and create batches
        id_list = list(doc_ids)
        batches = self._batch(id_list, self.batch_size)

        for batch_ids in batches:
            filter_query = self._format_azure_search_filter(batch_ids)
            docs = self.document_store.filter_documents(
                filters=filter_query,
            )
            doc_map.update({d.id: d for d in docs})

        return doc_map

    @component.output_types(documents=List[Document])
    def run(self, documents: List[Document], max_levels: Optional[int] = None):
        """
        For each document, fetch its parent chain, siblings, and children to build the full context.
        Uses batching for efficient bulk operations.

        Args:
            documents: List of retrieved documents to enrich
            max_levels: Maximum number of parent levels to traverse (None for unlimited)

        Returns:
            List of documents enriched with context
        """
        # Step 1: Collect all related IDs
        parent_ids, sibling_ids, child_ids = self._collect_all_related_ids(
            documents, max_levels
        )

        # Step 2: Fetch all related documents in a single operation
        all_related_ids = parent_ids | sibling_ids | child_ids
        if not all_related_ids:
            return {"documents": documents}

        related_docs = self._fetch_documents_in_batches(all_related_ids)

        # Step 3: Build context for each document
        for doc in documents:
            parent_chain = []
            siblings = []
            children = []

            # Get parents
            if parent_ids := doc.meta.get("parent_ids", []):
                if max_levels:
                    parent_ids = parent_ids[:max_levels]
                parent_chain = [
                    related_docs[pid] for pid in parent_ids if pid in related_docs
                ]

            # Get siblings
            if sibling_ids := doc.meta.get("sibling_ids", []):
                siblings = [
                    related_docs[sid]
                    for sid in sibling_ids 
                    if sid in related_docs
                ]

                all_current_related_docs = siblings + [doc]
                all_current_related_docs.sort(key=lambda d: d.meta.get("step", ""))
                mid = next((i for i, d in enumerate(all_current_related_docs) if d.id == doc.id), None)
                if mid is not None:
                    previous_siblings = all_current_related_docs[max(0, mid - 3):mid]
                    next_siblings = all_current_related_docs[mid + 1:mid + 4]
                else:
                    previous_siblings = []
                    next_siblings = []
                                   
                siblings = [("previous", s) for s in previous_siblings] + [("next", s) for s in next_siblings]

            # Get children
            if child_ids := doc.meta.get("child_ids", []):
                children = [
                    related_docs[cid] for cid in child_ids[:2] if cid in related_docs
                ]

            # Format all context
            if parent_chain or siblings or children:
                context = self._format_context_chain(parent_chain, siblings, children)
                doc.meta["context"] = context

        return {"documents": documents}
