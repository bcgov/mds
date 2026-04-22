from azure.search.documents.indexes.models import SearchField, SearchFieldDataType

# Index fields for the NoW application document search index.
# Intentionally simpler than the permit conditions index:
#   - No hierarchy fields (step, step_path, parent_ids, sibling_ids, child_ids)
#   - now_application_guid is filterable (always used as a mandatory pre-filter)
#   - document_type is facetable so the UI can filter by document category

fields = [
    SearchField(
        name="id",
        type=SearchFieldDataType.String,
        key=True,
        searchable=True,
        filterable=True,
        sortable=True,
        facetable=False,
    ),
    SearchField(
        name="content",
        type=SearchFieldDataType.String,
        searchable=True,
        filterable=False,
        sortable=False,
        facetable=False,
    ),
    # Mandatory pre-filter on every query — never exposed as a facet.
    SearchField(
        name="now_application_guid",
        type=SearchFieldDataType.String,
        searchable=False,
        filterable=True,
        sortable=False,
        facetable=False,
    ),
    # mine_guid is kept for future cross-application search (e.g. all NoW documents for a mine)
    # but is never used as a facet — mine is already known from the page context.
    # mine_name and mine_number are intentionally omitted: they would always return a single
    # facet value (the one mine linked to this application) and add no filtering value.
    SearchField(
        name="mine_guid",
        type=SearchFieldDataType.String,
        searchable=False,
        filterable=True,
        sortable=False,
        facetable=False,
    ),
    SearchField(
        name="document_manager_guid",
        type=SearchFieldDataType.String,
        searchable=False,
        filterable=True,
        sortable=False,
        facetable=False,
    ),
    SearchField(
        name="document_name",
        type=SearchFieldDataType.String,
        searchable=True,
        filterable=True,
        sortable=True,
        facetable=True,
    ),
    SearchField(
        name="document_type",
        type=SearchFieldDataType.String,
        searchable=True,
        filterable=True,
        sortable=True,
        facetable=True,
    ),
    SearchField(
        name="submitted_date",
        type=SearchFieldDataType.DateTimeOffset,
        searchable=False,
        filterable=True,
        sortable=True,
        facetable=True,
    ),
    SearchField(
        name="embedding",
        type="Collection(Edm.Half)",
        vector_search_dimensions=3072,
        vector_search_profile_name="vector-profile",
        searchable=True,
        filterable=False,
        sortable=False,
        facetable=False,
        stored=False,
    ),
]
