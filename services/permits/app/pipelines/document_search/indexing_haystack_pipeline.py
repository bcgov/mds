from pathlib import Path
from typing import Any, Callable, List

from app.pipelines.document_search.components.document_chunker import (
    DocumentChunkMetadata,
)
from haystack import Pipeline, component


@component
class MetadataBuilderComponent:
    @component.output_types(chunk_metadata=DocumentChunkMetadata)
    def run(self, now_application_guid: str, doc_meta: dict):
        return {
            "chunk_metadata": DocumentChunkMetadata(
                now_application_guid=now_application_guid,
                mine_guid=doc_meta.get("mine_guid", ""),
                document_manager_guid=doc_meta.get("document_manager_guid", ""),
                document_name=doc_meta.get("document_name", ""),
                document_type=doc_meta.get("document_type", ""),
                submitted_date=doc_meta.get("submitted_date"),
            )
        }


@component
class AnalyzeDocumentComponent:
    def __init__(
        self,
        run_document_intelligence_fn: Callable[[Path], Any],
        add_metadata_to_document_fn: Callable[[int, Any], Any],
    ):
        self._run_document_intelligence = run_document_intelligence_fn
        self._add_metadata_to_document = add_metadata_to_document_fn

    @component.output_types(analyze_result=Any, paragraph_documents=List[Any])
    def run(self, tmp_path: str):
        analyze_result = self._run_document_intelligence(Path(tmp_path))
        paragraph_documents = [
            self._add_metadata_to_document(idx, paragraph)
            for idx, paragraph in enumerate(analyze_result.paragraphs or [])
        ]
        return {
            "analyze_result": analyze_result,
            "paragraph_documents": paragraph_documents,
        }


@component
class TextChunkComponent:
    def __init__(self, chunk_documents_fn: Callable[[List[Any], DocumentChunkMetadata], dict]):
        self._chunk_documents = chunk_documents_fn

    @component.output_types(text_chunks=List[dict])
    def run(self, paragraph_documents: List[Any], chunk_metadata: DocumentChunkMetadata):
        result = self._chunk_documents(paragraph_documents, chunk_metadata)
        return {"text_chunks": result["chunks"]}


@component
class ArtifactExtractionComponent:
    def __init__(
        self,
        extract_page_rotation_hints_fn: Callable[[Any], dict],
        extract_table_artifacts_fn: Callable[[Any, dict, str, dict], List[dict]],
        extract_figure_artifacts_fn: Callable[[Any, dict, str, dict], List[dict]],
    ):
        self._extract_page_rotation_hints = extract_page_rotation_hints_fn
        self._extract_table_artifacts = extract_table_artifacts_fn
        self._extract_figure_artifacts = extract_figure_artifacts_fn

    @component.output_types(table_artifacts=List[dict], figure_artifacts=List[dict])
    def run(self, analyze_result: Any, doc_meta: dict, tmp_path: str):
        page_rotation_hints = self._extract_page_rotation_hints(analyze_result)
        table_artifacts = self._extract_table_artifacts(
            analyze_result,
            doc_meta,
            tmp_path,
            page_rotation_hints,
        )
        figure_artifacts = self._extract_figure_artifacts(
            analyze_result,
            doc_meta,
            tmp_path,
            page_rotation_hints,
        )
        return {
            "table_artifacts": table_artifacts,
            "figure_artifacts": figure_artifacts,
        }


@component
class FigureEnrichmentComponent:
    def __init__(self, enrich_figure_artifacts_fn: Callable[[List[dict]], None]):
        self._enrich_figure_artifacts = enrich_figure_artifacts_fn

    @component.output_types(figure_artifacts=List[dict])
    def run(self, figure_artifacts: List[dict]):
        self._enrich_figure_artifacts(figure_artifacts)
        return {"figure_artifacts": figure_artifacts}


@component
class ArtifactChunkBuilderComponent:
    def __init__(self, build_artifact_search_chunks_fn: Callable[[List[dict], DocumentChunkMetadata], List[dict]]):
        self._build_artifact_search_chunks = build_artifact_search_chunks_fn

    @component.output_types(artifacts=List[dict], artifact_chunks=List[dict])
    def run(
        self,
        table_artifacts: List[dict],
        figure_artifacts: List[dict],
        chunk_metadata: DocumentChunkMetadata,
    ):
        artifacts = table_artifacts + figure_artifacts
        artifact_chunks = self._build_artifact_search_chunks(artifacts, chunk_metadata)
        return {
            "artifacts": artifacts,
            "artifact_chunks": artifact_chunks,
        }


@component
class ChunkMergeComponent:
    @component.output_types(chunks=list, artifacts=list)
    def run(self, text_chunks: List[dict], artifact_chunks: List[dict], artifacts: List[dict]):
        return {
            "chunks": text_chunks + artifact_chunks,
            "artifacts": artifacts,
        }


def create_document_indexing_pipeline(
    *,
    run_document_intelligence_fn: Callable[[Path], Any],
    add_metadata_to_document_fn: Callable[[int, Any], Any],
    chunk_documents_fn: Callable[[List[Any], DocumentChunkMetadata], dict],
    extract_page_rotation_hints_fn: Callable[[Any], dict],
    extract_table_artifacts_fn: Callable[[Any, dict, str, dict], List[dict]],
    extract_figure_artifacts_fn: Callable[[Any, dict, str, dict], List[dict]],
    enrich_figure_artifacts_fn: Callable[[List[dict]], None],
    build_artifact_search_chunks_fn: Callable[[List[dict], DocumentChunkMetadata], List[dict]],
) -> Pipeline:
    pipeline = Pipeline()

    pipeline.add_component("metadata_builder", MetadataBuilderComponent())
    pipeline.add_component(
        "analyzer",
        AnalyzeDocumentComponent(
            run_document_intelligence_fn=run_document_intelligence_fn,
            add_metadata_to_document_fn=add_metadata_to_document_fn,
        ),
    )
    pipeline.add_component(
        "text_chunker",
        TextChunkComponent(chunk_documents_fn=chunk_documents_fn),
    )
    pipeline.add_component(
        "artifact_extractor",
        ArtifactExtractionComponent(
            extract_page_rotation_hints_fn=extract_page_rotation_hints_fn,
            extract_table_artifacts_fn=extract_table_artifacts_fn,
            extract_figure_artifacts_fn=extract_figure_artifacts_fn,
        ),
    )
    pipeline.add_component(
        "figure_enricher",
        FigureEnrichmentComponent(enrich_figure_artifacts_fn=enrich_figure_artifacts_fn),
    )
    pipeline.add_component(
        "artifact_chunk_builder",
        ArtifactChunkBuilderComponent(build_artifact_search_chunks_fn=build_artifact_search_chunks_fn),
    )
    pipeline.add_component("chunk_merger", ChunkMergeComponent())

    pipeline.connect("metadata_builder.chunk_metadata", "text_chunker.chunk_metadata")
    pipeline.connect("metadata_builder.chunk_metadata", "artifact_chunk_builder.chunk_metadata")
    pipeline.connect("analyzer.paragraph_documents", "text_chunker.paragraph_documents")
    pipeline.connect("analyzer.analyze_result", "artifact_extractor.analyze_result")
    pipeline.connect("artifact_extractor.figure_artifacts", "figure_enricher.figure_artifacts")
    pipeline.connect("artifact_extractor.table_artifacts", "artifact_chunk_builder.table_artifacts")
    pipeline.connect("figure_enricher.figure_artifacts", "artifact_chunk_builder.figure_artifacts")
    pipeline.connect("text_chunker.text_chunks", "chunk_merger.text_chunks")
    pipeline.connect("artifact_chunk_builder.artifact_chunks", "chunk_merger.artifact_chunks")
    pipeline.connect("artifact_chunk_builder.artifacts", "chunk_merger.artifacts")

    return pipeline
